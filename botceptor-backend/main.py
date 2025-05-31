from concurrent.futures import ThreadPoolExecutor
import json
import re
import time
import uuid
import requests
import websocket
from termcolor import colored
import threading


test_json = {
    "hostname": "192.168.1.24:8003",
    "bot_name": "MandateTestingBot3",
    "call_count": 1,
    "questions": [
        {
            "question": "i need to know what all item was picked up",
            "expected_answer": "your order involve ",
            "expected_objectives": ["Handle_Order_Related_Queries"],
            "expected_tools": ["answer_order_related_queries"],
        },
        {
            "question": "i need to know the order status again",
            "expected_answer": "The weather is sunny with a high of 25 degrees.",
            "expected_objectives": ["Handle_Order_Related_Queries"],
            "expected_tools": ["get_order_status"],
        },
        {
            "question": "i want to cancel the order",
            "expected_answer": "The weather is sunny with a high of 25 degrees.",
            "expected_objectives": ["Handle_Order_Cancellation_Queries"],
            "expected_tools": ["get_order_cancellation_details"],
        },
        {
            "question": "i want to cancel the order",
            "expected_answer": "The weather is sunny with a high of 25 degrees.",
            "expected_objectives": ["Handle_Order_Cancellation_Queries"],
            "expected_tools": ["get_order_cancellation_details"],
        },
        {
            "question": "i want to cancel the order",
            "expected_answer": "The weather is sunny with a high of 25 degrees.",
            "expected_objectives": ["Handle_Order_Cancellation_Queries"],
            "expected_tools": ["get_order_cancellation_details"],
        }
    ]
}


class WebsocketClient:
    def __init__(self, socket_url):
        self.ws = None
        self.socket_url = socket_url

    def send_message(self, message):
        message_json = json.dumps(message)
        self.ws.send(message_json)

    def receive_message(self):
        try:
            message = self.ws.recv()
            return json.loads(message)
        except Exception as e:
            print(colored(f"Error receiving message: {e}", "red"))
            return None

    def connect(self):
        print(f"Attempting to connect to WebSocket at {self.socket_url}")

        try:
            self.ws = websocket.create_connection(self.socket_url)
            print(colored("WebSocket connection successfully established!", "green"))
        except Exception as e:
            print(colored(f"Error connecting to WebSocket: {e}", "red"))
            return False
        return True

    def close(self):
        if self.ws:
            self.ws.close()
            print(colored("WebSocket connection closed.", "yellow"))


class TestBot:
    def __init__(self, id, hostname, bot_name, questions):
        self.id = id
        self.questions = questions
        self.current_question_index = 0
        self.session_id = str(uuid.uuid4())
        self.socket_url = f"ws://{hostname}/bots/{bot_name}/sessions/{self.session_id}"
        self.client = WebsocketClient(self.socket_url)
        self.report = {
            "session_id": self.session_id,
            "conversation": []
        }

        print(colored(
            f"TestBot[{self.id}] initialized with session_id: {self.session_id}", "green"))

    def start_session(self):
        self.client.connect()
        start_message = {
            "event": "start",
            "session_id": self.session_id,
            "mime_type": "text/plain",
            "payload": {
                "metadata": {
                    'repeated_call_count': 0,
                    'repeated_call_look_back_interval': 20,
                    'repeated_call_timestamps': []
                },
                "entities": {
                    "mobile_number": "1234567890",
                }
            }
        }

        self.client.send_message(start_message)
        response = self.client.receive_message()
        print(
            f"TestBot[{self.id}] initial context: {response.get('payload', {}).get('text', 'No data')}", "blue")
        return response

    def run(self):
        for i, question_data in enumerate(self.questions):
            question = question_data["question"]
            print(
                colored(f"TestBot[{self.id}] Asking question[{i+1}]: {question}", "cyan"))
            message = {
                "event": "generate",
                "session_id": self.session_id,
                "channel": "chat",
                "mime_type": "text/plain",
                "payload": {
                    "text": question
                }
            }
            self.client.send_message(message)
            response = self.client.receive_message()

            answer = response.get('payload', {}).get('text', 'No data')
            self.report["conversation"].append({
                "question": question,
                "response": answer,
                "expected_objectives": question_data.get("expected_objectives", []),
                "expected_tools": question_data.get("expected_tools", []),
                "event": response.get('event', 'unknown'),
            })
            print(colored(
                f"TestBot[{self.id}] Got answer[{i+1}]: {answer}", "magenta"))
            time.sleep(3)

        print(
            colored(f"TestBot[{self.id}] - ALL requests completed.", "green"))
        self.client.close()

        self.generate_report()

    def chat(self, question):
        message = {
            "event": "generate",
            "session_id": self.session_id,
            "channel": "chat",
            "mime_type": "text/plain",
            "payload": {
                "text": question
            }
        }
        self.client.send_message(message)
        response = self.client.receive_message()
        return response.get('payload', {}).get('text', 'Some error occurred')

    def get_metrics_for_last_request(self):
        hostname = self.client.socket_url.split('/')[2]
        response = requests.get(
            f"http://{hostname}/session-logs/{self.session_id}")
        if response.status_code == 200:
            logs = response.json()
            if logs:
                log_line = logs[-1]
        if not hasattr(self, 'all_tool_calls'):
            self.all_tool_calls = [] #workaround for empty list (code quality improve madbeku)
        res = {}
        res["used_objectives"], res["used_tool_calls"] = self.__process_log_line(log_line)
        return res

    def generate_report(self):
        hostname = self.client.socket_url.split('/')[2]
        response = requests.get(
            f"http://{hostname}/session-logs/{self.session_id}")
        if response.status_code == 200:
            self.all_tool_calls = []
            final_result = "passed"
            for i, log_line in enumerate(response.json()):
                chat_data = self.report["conversation"][i]
                chat_data["used_objectives"], chat_data["used_tool_calls"] = self.__process_log_line(log_line)

                chat_data["is_passed"] = (chat_data["expected_objectives"] == chat_data[
                    "used_objectives"] and chat_data["expected_tools"] == chat_data["used_tool_calls"])

                if not chat_data["is_passed"]:
                    final_result = "failed"
            self.report["final_result"] = final_result
            print(
                colored(f"Report for session {self.session_id}: {self.report}", "green"))
        else:
            print(
                colored(f"Failed to fetch logs for {self.session_id}", "red"))

    def __get_diff(self, a, b):
        i = 0
        while i < len(a):
            if a[i] == b[i]:
                i += 1
        return b[i:]

    def __process_log_line(self, log_line):
        match = re.search(r"'dialog_state': (\[[^\]]*\])", log_line)
        dialog_states = match.group(1) if match else "[]"

        tool_calls = []
        tool_calls_matches = re.finditer(
            r"'name':\s*'([^']+)'", log_line)
        for match in tool_calls_matches:
            tool_call = match.group(1)
            if tool_call not in tool_calls and tool_call != "0" and "Assistant" not in tool_call:
                tool_calls.append(tool_call)
        diff_tool_calls = self.__get_diff(self.all_tool_calls, tool_calls)
        self.all_tool_calls.extend(diff_tool_calls)

        return json.loads(dialog_states.replace("'", '"')), diff_tool_calls


class TestController:
    def __init__(self, tc_inputs: dict):
        self.hostname = tc_inputs.get("hostname", "0.0.0.0:8003")
        self.bot_name = tc_inputs.get("bot_name", "chandan")
        self.call_count = int(tc_inputs.get("call_count", 1))
        self.questions = tc_inputs.get("questions", [])
        self.test_bots = []

        print(
            f"TestController initialized with hostname: {self.hostname}, bot_name: {self.bot_name}, call_count: {self.call_count}, total_questions: {len(self.questions)}")

    def initialize_bots(self):
        self.test_bots = []
        for i in range(self.call_count):
            test_bot = TestBot(i+1, self.hostname,
                               self.bot_name, self.questions)
            test_bot.start_session()
            self.test_bots.append(test_bot)
        print(colored("Test bots are ready to run", "green"))

    def run_bots(self):
        print("Starting test bots...")
        with ThreadPoolExecutor(max_workers=5) as executor:
            for bot in self.test_bots:
                executor.submit(bot.run)

    def get_test_report(self):
        reports = [bot.report for bot in self.test_bots]
        return reports


if __name__ == "__main__":
    tc = TestController(tc_inputs=test_json)
    tc.initialize_bots()
    tc.run_bots()
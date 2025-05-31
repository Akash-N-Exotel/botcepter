import uuid
from fastapi import FastAPI
import uvicorn
from fastapi.middleware.cors import CORSMiddleware


from main import TestBot, TestController


app = FastAPI()

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

bots = {}

@app.get("/")
async def read_root():
    return {"message": "Botcept Server is running!"}


@app.post("/run-test")
async def run_test(request: dict):
    tc = TestController(tc_inputs=request)
    tc.initialize_bots()
    tc.run_bots()
    reports = tc.get_test_report()
    return {"success": True, "data": reports}
    return {
    "success": True,
    "data": [
        {
            "session_id": "b5143178-0e43-4841-bfed-bb5cf36a4e3b",
            "conversation": [
                {
                    "question": "i need to know what all item was picked up",
                    "response": "Your order includes the following items: Box Mast XTRM S, Tomato, Spicy Mayo, and Spicy Mayo. Is there anything else I can help you with?",
                    "expected_objectives": [
                        "Handle_Order_Related_Queries"
                    ],
                    "expected_tools": [
                        "answer_order_related_queries"
                    ],
                    "event": "response",
                    "used_objectives": [
                        "Handle_Order_Related_Queries"
                    ],
                    "used_tool_calls": [
                        "answer_order_related_queries"
                    ],
                    "is_passed": True
                },
                {
                    "question": "i need to know the order status again",
                    "response": "Apologies for the delay in order delivery. I am transferring your call to an agent, who will assist you.",
                    "expected_objectives": [
                        "Handle_Order_Related_Queries"
                    ],
                    "expected_tools": [
                        "get_order_status"
                    ],
                    "event": "response",
                    "used_objectives": [
                        "Handle_Order_Related_Queries"
                    ],
                    "used_tool_calls": [
                        "get_order_status"
                    ],
                    "is_passed": True
                },
                {
                    "question": "i want to cancel the order",
                    "response": "",
                    "expected_objectives": [
                        "Handle_Order_Cancellation_Queries"
                    ],
                    "expected_tools": [
                        "get_order_cancellation_details"
                    ],
                    "event": "transfer_call",
                    "used_objectives": [],
                    "used_tool_calls": [
                        "CompleteOrEscalate"
                    ],
                    "is_passed": False
                },
                {
                    "question": "i want to cancel the order",
                    "response": "I will transfer your call to an agent who can assist you with the order cancellation. Please hold on for a moment.",
                    "expected_objectives": [
                        "Handle_Order_Cancellation_Queries"
                    ],
                    "expected_tools": [
                        "get_order_cancellation_details"
                    ],
                    "event": "response"
                },
                {
                    "question": "i want to cancel the order",
                    "response": "",
                    "expected_objectives": [
                        "Handle_Order_Cancellation_Queries"
                    ],
                    "expected_tools": [
                        "get_order_cancellation_details"
                    ],
                    "event": "transfer_call"
                }
            ],
            "final_result": "failed"
        }
    ]
}

@app.post("/start-chat")
async def start_chat(request: dict):
    bot_name = request.get("bot_name", "MandateTestingBot3")
    hostname = request.get("hostname", "0.0.0.0:8003")
    id = uuid.uuid4()
    tb = TestBot(id=id, hostname=hostname, bot_name=bot_name, questions=[])
    start_session_response = tb.start_session().get("payload", {}).get("text", "Some error occurred while starting the session.")
    bots[str(id)] = tb
    return {"success": True, "session_id": str(id), "greeting": start_session_response}

@app.post("/chat")
async def send_message(request: dict):
    session_id = request.get("session_id")
    query = request.get("query")
    tb = bots.get(session_id)
    if not tb:
        return {"success": False, "message": "Session not found."}
    response = tb.chat(query)
    if not response:
        return {"success": False, "message": "No response from bot."}
    metrics = tb.get_metrics_for_last_request()
    response = {
        "response": response,
        "used_objectives": metrics.get("used_objectives", []),
        "used_tool_calls": metrics.get("used_tool_calls", [])
    }
    return {"success": True, "data": response}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
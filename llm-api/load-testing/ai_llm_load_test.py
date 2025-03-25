import asyncio
import aiohttp
import json
import time

# Base URL for the Ollama API
url = "http://localhost:11434/api/chat"

# Number of requests to be sent
REQUEST_COUNT = 200

# Define the payloads for the requests
payloads = [
    {
        "model": "llama3.2:1b",
        "messages": [{"role": "user", "content": f"Summarize all the following tasks in a dashed list: I need to go to the gym and eat breakfast"}],
    }
    for _ in range(1, REQUEST_COUNT + 1)
]

# Track response times and errors
response_times = []
success_count = 0
error_count = 0
errors = []
responses = []

# Function to send a request, process the response, and measure response time
async def query_ollama(session, payload, question_number):
    global success_count, error_count
    start_time = time.time()
    response_text = ""

    try:
        async with session.post(url, json=payload) as response:
            elapsed_time = time.time() - start_time
            response_times.append(elapsed_time)

            if response.status == 200:
                async for line in response.content:
                    line = line.decode("utf-8").strip()
                    if line:
                        try:
                            json_data = json.loads(line)
                            if "message" in json_data and "content" in json_data["message"]:
                                response_text += json_data["message"]["content"]
                        except json.JSONDecodeError:
                            pass  # Ignore malformed JSON lines

                success_count += 1
                output = f"\nRequest {question_number}: SUCCESS ({elapsed_time:.2f} sec)\nResponse:\n{response_text}\n"
                responses.append(output)
                print(output)
                return output
            else:
                error_message = f"\nRequest {question_number}: ERROR {response.status} - {await response.text()}"
                errors.append(error_message)
                error_count += 1
                print(error_message)
                return error_message
    except Exception as e:
        elapsed_time = time.time() - start_time
        error_message = f"\nRequest {question_number}: FAILED - {e}"
        errors.append(error_message)
        error_count += 1
        response_times.append(elapsed_time)
        print(error_message)
        return error_message

# Main function to handle requests concurrently and measure total time and report
async def main():
    start_time = time.time()

    async with aiohttp.ClientSession() as session:
        tasks = [query_ollama(session, payload, i + 1) for i, payload in enumerate(payloads)]
        await asyncio.gather(*tasks)

    end_time = time.time()
    total_time = end_time - start_time

    # Compute statistics
    avg_response_time = sum(response_times) / len(response_times) if response_times else 0
    success_rate = (success_count / REQUEST_COUNT) * 100
    error_rate = (error_count / REQUEST_COUNT) * 100

    # Generate report
    report_content = f"""
    === LOAD TEST REPORT ===
    Total Requests: {REQUEST_COUNT}
    Successful Requests: {success_count}
    Failed Requests: {error_count}
    Success Rate: {success_rate:.2f}%
    Error Rate: {error_rate:.2f}%
    Total Execution Time: {total_time:.2f} sec
    Average Response Time: {avg_response_time:.2f} sec

    === ERROR DETAILS ===
    """ + ("\n".join(errors) if errors else "No errors encountered.") + "\n"

    # Write report to a file
    with open("load_test_report.txt", "w") as report_file:
        report_file.write(report_content + "\n".join(responses))

    print("\nLoad test completed. Report saved as 'load_test_report.txt'.")

# Run the main function
if __name__ == "__main__":
    asyncio.run(main())

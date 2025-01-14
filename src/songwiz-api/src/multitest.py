from multiprocessing import Pool, get_context
import os

def worker_function(x):
    print(f"Worker PID {os.getpid()} - Processing {x}")
    return x * x

if __name__ == "__main__":
    print(f"Main PID: {os.getpid()} - Starting.")
    try:
        with get_context("spawn").Pool() as pool:
            results = pool.map(worker_function, range(5))
        print(f"Results: {results}")
    except Exception as e:
        print(f"Error: {e}")

from __future__ import annotations

import socket
from pathlib import Path

import uvicorn


HOST = "127.0.0.1"
PORTS = range(8000, 8011)


def find_available_port() -> int:
    for port in PORTS:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
            try:
                sock.bind((HOST, port))
            except OSError:
                continue
            return port
    raise RuntimeError("No available backend port found in 8000-8010.")


def write_frontend_env(port: int) -> None:
    frontend_env = Path(__file__).resolve().parents[1] / ".env.local"
    frontend_env.write_text(f"VITE_API_BASE=http://{HOST}:{port}\n", encoding="utf-8")


if __name__ == "__main__":
    port = find_available_port()
    write_frontend_env(port)
    print(f"Backend running at http://{HOST}:{port}")
    print("Updated frontend .env.local with VITE_API_BASE.")
    uvicorn.run("app.main:app", host=HOST, port=port)

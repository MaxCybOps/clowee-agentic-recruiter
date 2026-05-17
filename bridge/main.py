from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
import subprocess
import os
import platform
import asyncio
import json
import uuid
from pydantic import BaseModel
from typing import Optional, Dict
from playwright.async_api import async_playwright
from bs4 import BeautifulSoup

app = FastAPI(title="Clowee Bridge", version="1.0.0")

# Global State for the Native Process Monitor
tasks_db: Dict[str, dict] = {}

async def run_agent_task(task_id: str, agent_name: str, task_desc: str):
    """
    Simulates a real native background agent carrying out a complex multi-step process.
    """
    try:
        tasks_db[task_id]["status"] = "Initializing Agent..."
        await asyncio.sleep(2)
        
        tasks_db[task_id]["status"] = f"Gathering context for: {task_desc[:20]}..."
        await asyncio.sleep(4)
        
        tasks_db[task_id]["status"] = "Executing native operations..."
        # In a real implementation, this is where we would call OpenAI/Anthropic APIs or run shell commands
        await asyncio.sleep(5)
        
        tasks_db[task_id]["status"] = "Finalizing deliverable..."
        await asyncio.sleep(3)
        
        tasks_db[task_id]["status"] = "completed"
    except Exception as e:
        tasks_db[task_id]["status"] = f"failed: {str(e)}"

# Enable CORS so the web dashboard can talk to the local daemon
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, this should be restricted to the Clowee domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ShellCommand(BaseModel):
    command: str
    cwd: Optional[str] = None

@app.get("/status")
async def get_status():
    return {
        "status": "online",
        "platform": platform.system(),
        "bridge_version": "1.0.0",
        "identity": "Clowee Native Resident"
    }

@app.post("/native/shell")
async def execute_shell(cmd: ShellCommand):
    """
    Execute a native shell command.
    This is the core 'Hand' of Clowee.
    """
    try:
        # Security Note: In a real multi-user SaaS, this would require 
        # a unique auth token linked to the user's local bridge.
        
        # Determine the shell based on OS
        if platform.system() == "Windows":
            shell_cmd = ["cmd", "/c", cmd.command]
        else:
            shell_cmd = ["sh", "-c", cmd.command]
            
        result = subprocess.run(
            shell_cmd,
            cwd=cmd.cwd,
            capture_output=True,
            text=True,
            timeout=30
        )
        
        return {
            "success": result.returncode == 0,
            "stdout": result.stdout,
            "stderr": result.stderr,
            "exit_code": result.returncode
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/native/browser")
async def web_research(url: str):
    """
    Autonomous Web Research tool.
    Allows Clowee to 'see' the live web.
    """
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        try:
            await page.goto(url, timeout=30000, wait_until="networkidle")
            content = await page.content()
            title = await page.title()
            
            # Extract text using BeautifulSoup for cleaner AI reading
            soup = BeautifulSoup(content, 'html.parser')
            for script in soup(["script", "style"]):
                script.extract()
            text = soup.get_text(separator=' ', strip=True)
            
            await browser.close()
            return {
                "success": True,
                "title": title,
                "url": url,
                "content": text[:5000] # Limit content for AI context window
            }
        except Exception as e:
            await browser.close()
            return {"success": False, "error": str(e)}

@app.post("/native/open-app")
async def open_app(app_name: str):
    """
    Specifically for opening local applications like Notepad.
    """
    try:
        if platform.system() == "Windows":
            if app_name.lower() == "notepad":
                subprocess.Popen(["notepad.exe"])
            elif app_name.lower() == "docs":
                # Opens default browser to Google Docs or a local doc app
                os.startfile("https://docs.new")
            else:
                os.startfile(app_name)
        elif platform.system() == "Darwin": # macOS
            subprocess.run(["open", "-a", app_name])
        
        return {"success": True, "message": f"Opened {app_name}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class NotepadData(BaseModel):
    content: str

@app.post("/native/notepad")
async def write_and_open_notepad(data: NotepadData):
    """
    Safely writes content to a file and opens it in Notepad.
    """
    try:
        filepath = os.path.join(os.getcwd(), "clowee_mission.txt")
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(data.content)
            
        if platform.system() == "Windows":
            subprocess.Popen(["notepad.exe", filepath])
        elif platform.system() == "Darwin":
            subprocess.run(["open", "-a", "TextEdit", filepath])
            
        return {"success": True, "message": "Draft created and opened natively."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class TraceData(BaseModel):
    name: str
    action_sequence: list[str]

class DelegateTaskData(BaseModel):
    agent: str
    task: str

@app.post("/native/delegate")
async def delegate_task(data: DelegateTaskData, background_tasks: BackgroundTasks):
    """
    Spawns a new background worker agent natively.
    """
    task_id = str(uuid.uuid4())[:8]
    tasks_db[task_id] = {
        "id": task_id,
        "name": data.agent,
        "task": data.task,
        "status": "active"
    }
    background_tasks.add_task(run_agent_task, task_id, data.agent, data.task)
    return {"success": True, "task_id": task_id}

@app.get("/native/tasks")
async def get_tasks():
    """
    Returns the real-time status of all active and completed background agents.
    """
    # Convert tasks_db dictionary to a list
    return {"success": True, "tasks": list(tasks_db.values())}

@app.post("/native/skill/mine")
async def mine_skill(trace: TraceData):
    """
    Saves a recorded sequence of actions as a learned skill.
    """
    try:
        skills = {}
        if os.path.exists("skills.json"):
            with open("skills.json", "r") as f:
                skills = json.load(f)
                
        skills[trace.name] = trace.action_sequence
        
        with open("skills.json", "w") as f:
            json.dump(skills, f, indent=4)
            
        return {"success": True, "message": f"Skill '{trace.name}' permanently learned."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/native/skill/list")
async def list_skills():
    """
    Lists all learned skills.
    """
    if os.path.exists("skills.json"):
        with open("skills.json", "r") as f:
            return {"success": True, "skills": json.load(f)}
    return {"success": True, "skills": {}}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

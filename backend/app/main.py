import os
from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, DateTime, ForeignKey, JSON
from sqlalchemy.orm import sessionmaker, relationship, declarative_base, Session
from pydantic import BaseModel, Field, validator, constr
from datetime import datetime
from typing import List, Optional
import json
import pandas as pd
import asyncio

# Get the absolute path to the data directory
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(os.path.dirname(BASE_DIR), 'data')


# Database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./social_analytics.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Database models
class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    status = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    filters = Column(JSON)
    posts = relationship("Post", back_populates="task")

class Post(Base):
    __tablename__ = "posts"

    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, ForeignKey("tasks.id"))
    source = Column(String)  # e.g. 'twitter', 'instagram', 'facebook'
    post_id = Column(String)
    timestamp = Column(DateTime)
    content = Column(String)
    likes = Column(Integer)
    comments = Column(Integer)
    shares = Column(Integer)
    hashtags = Column(JSON)
    content_type = Column(String)  # e.g. 'text', 'image', 'video', 'link'
    task = relationship("Task", back_populates="posts")

# Create the database tables
Base.metadata.create_all(bind=engine)

class TaskCreate(BaseModel):
    name: str
    filters: dict

class TaskResponse(BaseModel):
    id: int
    name: str
    status: str
    created_at: datetime
    completed_at: Optional[datetime] 
    filters: dict

    class Config:
        from_attributes = True

class PostResponse(BaseModel):
    id: int
    source: str
    post_id: str
    timestamp: datetime
    content: str
    likes: int
    comments: int
    shares: int
    hashtags: List[str]
    content_type: str

    class Config:
        from_attributes = True

# FastAPI app
app = FastAPI(
    title="Social Media Analytics API",
    description="API for analyzing social media data",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db() -> Session:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

async def process_task(task_id: int, filters: dict, db: Session):
    print("Processing task...")
    try:
        # Get and validate task
        task = db.query(Task).filter(Task.id == task_id).first()
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
        
        # Update task status
        task.status = "in_progress"
        db.commit()

        await asyncio.sleep(5)

        # Load data
        twitter_data = load_twitter_data()
        instagram_data = load_instagram_data()
        print("Data loaded")
        print("twitter_data", twitter_data)
        print("instagram_data", instagram_data)

        # Process data based on filters
        process_twitter_data(task_id, twitter_data, filters, db)
        process_instagram_data(task_id, instagram_data, filters, db)
        print("Data processed")

        # Update task status to completed
        task.status = "completed"
        task.completed_at = datetime.utcnow()
        db.commit()

    except Exception as e:
        task.status = "failed"
        db.commit()
        raise HTTPException(status_code=500, detail=f"Error processing task: {str(e)}")

def load_twitter_data():
    try:
        with open(os.path.join(DATA_DIR, "twitter_data.json"), "r") as f:
            return json.load(f)
    except FileNotFoundError:
        print("Warning: twitter_data.json not found")
        return []

def load_instagram_data():
    try:
        return pd.read_csv(os.path.join(DATA_DIR, "instagram_data.csv"))
    except FileNotFoundError:
        print("Warning: instagram_data.csv not found")
        return pd.DataFrame()

def process_twitter_data(task_id: int, data: list, filters: dict, db: Session):
    print("Processing twitter data...")
    if not data or "twitter" not in filters.get("platforms", []):
        return

    for post in data:
        if not matches_filters(post, filters):
            continue
        print("post", post)
        db_post = Post(
            task_id=task_id,
            source="twitter",
            post_id=post["id"],
            timestamp=datetime.fromisoformat(post["timestamp"]),
            content=post["content"],
            likes=post["likes"],
            comments=post["comments"],
            shares=post["shares"],
            hashtags=post["hashtags"],
            content_type=post["content_type"]
        )
        print("db_post twitter", db_post)
        db.add(db_post)

def process_instagram_data(task_id: int, data: pd.DataFrame, filters: dict, db: Session):
    print(f"Data received: {len(data)} rows")
    print("Filters received:", filters)
    if data.empty or "instagram" not in filters.get("platforms", []):
        return
    print("Processing instagram data...")
    for _, row in data.iterrows():
        try:
            print(f"Checking row: {row.to_dict()}") 
            if not matches_filters(row, filters):
                continue
            print("matches_filters")
            print(task_id, row["timestamp"])
            db_post = Post(
                task_id=task_id,
                source="instagram",
                post_id=str(row["id"]),
                timestamp=pd.to_datetime(row["timestamp"]),
                content=row["content"],
                likes=int(row["likes"]) if pd.notna(row["likes"]) else 0,
                comments=int(row["comments"]) if pd.notna(row["comments"]) else 0,
                shares=int(row["shares"]) if pd.notna(row["shares"]) else 0,
                hashtags=row["hashtags"].split(",") if isinstance(row["hashtags"], str) else [],
                content_type=row["content_type"]
            )
            print("db_post instagram", db_post)
            db.add(db_post)
        except Exception as e:
            print(f"Warning: Error processing Instagram row: {str(e)}")

def matches_filters(post: dict, filters: dict) -> bool:
    start_date = filters.get("start_date")
    end_date = filters.get("end_date")
    hashtags = filters.get("hashtags", [])

    # Check date filters
    post_date = post.get("timestamp")
    if start_date and post_date < start_date:
        return False
    if end_date and post_date > end_date:
        return False

    # Check hashtag filters
    if hashtags and not any(tag in post.get("hashtags", []) for tag in hashtags):
        return False

    return True

@app.get("/tasks", response_model=List[TaskResponse])
async def get_tasks(db: Session = Depends(get_db)) -> List[TaskResponse]:
    try:
        tasks = db.query(Task).all()
        return [TaskResponse.model_validate(task) for task in tasks]
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving tasks: {str(e)}"
        )

@app.get("/tasks/{task_id}", response_model=TaskResponse)
async def get_task(task_id:int, db: Session = Depends(get_db)) -> TaskResponse:
    task = db.query(Task).filter(Task.id == task_id).first()
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    
    try:
        return TaskResponse.model_validate(task)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving task: {str(e)}"
        )

@app.get("/tasks/{task_id}/posts", response_model=List[PostResponse])
async def get_task_posts(task_id: int, db: Session = Depends(get_db)) -> PostResponse:
    try:
        posts = db.query(Post).filter(Post.task_id == task_id).all()
        if posts is None:
            raise HTTPException(status_code=404, detail="No posts found for this task")
        return [PostResponse.model_validate(post) for post in posts]
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving posts: {str(e)}"
        )

@app.get("/analytics/{task_id}")
async def get_task_analytics(task_id: int, db: Session = Depends(get_db)):
    try:
        posts = db.query(Post).filter(Post.task_id == task_id).all()
        if posts is None:
            raise HTTPException(status_code=404, detail="No posts found for this task")
        
        # Calculate analytics
        total_posts = len(posts)
        total_engagement = sum(post.likes + post.comments + post.shares for post in posts)
        engagement_rate = total_engagement / total_posts if total_posts > 0 else 0

        # Get top hashtags
        hashtag_counts = {}
        for post in posts:
            for hashtag in post.hashtags:
                hashtag_counts[hashtag] = hashtag_counts.get(hashtag, 0) + 1
        
        return {
            "total_posts": total_posts,
            "total_engagement": total_engagement,
            "hashtag_counts": hashtag_counts
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving analytics: {str(e)}"
        )

@app.post("/tasks", response_model=TaskResponse)
async def create_task(task: TaskCreate, background_tasks: BackgroundTasks, db: Session = Depends(get_db)) -> TaskResponse:
    try:
        # Create new task with default status
        db_task = Task(
            name=task.name,
            filters=task.filters,
            status="pending"  # Set initial status
        )
        
        # Add to database
        db.add(db_task)
        db.commit()
        db.refresh(db_task)  # Refresh to get the generated ID

        # Start the task in the background
        background_tasks.add_task(process_task, db_task.id, task.filters, db)
        
        # Convert to response model
        return TaskResponse.model_validate(db_task)
    except Exception as e:
        db.rollback()  # Rollback in case of error
        raise HTTPException(
            status_code=500,
            detail=f"Error creating task: {str(e)}"
        )
    



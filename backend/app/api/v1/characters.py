from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ...core.database import get_db
from ...core.security import get_current_user
from ...models.user import User
from ...models.character import Character, CharacterImage
from ...schemas.character import CharacterCreate, CharacterResponse, CharacterUpdate

router = APIRouter()

@router.get("/", response_model=List[CharacterResponse])
async def get_characters(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """获取角色列表"""
    characters = db.query(Character).filter(
        Character.user_id == current_user.id
    ).offset(skip).limit(limit).all()
    return characters

@router.post("/", response_model=CharacterResponse)
async def create_character(
    character: CharacterCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """创建新角色"""
    db_character = Character(**character.dict(), user_id=current_user.id)
    db.add(db_character)
    db.commit()
    db.refresh(db_character)
    return db_character

@router.get("/{character_id}", response_model=CharacterResponse)
async def get_character(
    character_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """获取单个角色"""
    character = db.query(Character).filter(
        Character.id == character_id,
        Character.user_id == current_user.id
    ).first()
    if not character:
        raise HTTPException(status_code=404, detail="角色不存在")
    return character

@router.put("/{character_id}", response_model=CharacterResponse)
async def update_character(
    character_id: str,
    character: CharacterUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """更新角色"""
    db_character = db.query(Character).filter(
        Character.id == character_id,
        Character.user_id == current_user.id
    ).first()
    if not db_character:
        raise HTTPException(status_code=404, detail="角色不存在")
    
    for field, value in character.dict(exclude_unset=True).items():
        setattr(db_character, field, value)
    
    db.commit()
    db.refresh(db_character)
    return db_character

@router.delete("/{character_id}")
async def delete_character(
    character_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """删除角色"""
    character = db.query(Character).filter(
        Character.id == character_id,
        Character.user_id == current_user.id
    ).first()
    if not character:
        raise HTTPException(status_code=404, detail="角色不存在")
    
    db.delete(character)
    db.commit()
    return {"message": "角色删除成功"} 
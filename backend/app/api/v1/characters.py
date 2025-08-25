from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import oauth2_scheme, verify_token
from app.models.character import Character, CharacterImage
from app.models.user import User
from app.schemas.character import CharacterCreate, CharacterResponse, CharacterUpdate
from typing import List
import logging
import uuid

logger = logging.getLogger(__name__)

router = APIRouter()

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """获取当前用户"""
    payload = verify_token(token)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user_id = payload.get("sub")
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user

@router.post("/", response_model=CharacterResponse, status_code=status.HTTP_201_CREATED)
async def create_character(
    character_data: CharacterCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """创建新角色"""
    try:
        # 检查角色名称是否已存在
        existing_character = db.query(Character).filter(
            Character.name == character_data.name,
            Character.user_id == current_user.id
        ).first()
        
        if existing_character:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Character name already exists for this user"
            )
        
        # 创建角色
        db_character = Character(
            name=character_data.name,
            description=character_data.description,
            user_id=current_user.id,
            metadata=character_data.metadata or {}
        )
        
        db.add(db_character)
        db.commit()
        db.refresh(db_character)
        
        logger.info(f"Character created: {character_data.name} by user {current_user.email}")
        return CharacterResponse(
            id=str(db_character.id),
            name=db_character.name,
            description=db_character.description,
            user_id=str(db_character.user_id),
            metadata=db_character.metadata,
            is_public=db_character.is_public,
            created_at=db_character.created_at
        )
        
    except Exception as e:
        logger.error(f"Character creation failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create character"
        )

@router.get("/", response_model=List[CharacterResponse])
async def get_characters(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100
):
    """获取用户的所有角色"""
    try:
        characters = db.query(Character).filter(
            Character.user_id == current_user.id
        ).offset(skip).limit(limit).all()
        
        return [
            CharacterResponse(
                id=str(char.id),
                name=char.name,
                description=char.description,
                user_id=str(char.user_id),
                metadata=char.metadata,
                is_public=char.is_public,
                created_at=char.created_at
            )
            for char in characters
        ]
        
    except Exception as e:
        logger.error(f"Failed to get characters: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get characters"
        )

@router.get("/{character_id}", response_model=CharacterResponse)
async def get_character(
    character_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """获取特定角色详情"""
    try:
        character = db.query(Character).filter(
            Character.id == character_id,
            Character.user_id == current_user.id
        ).first()
        
        if not character:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Character not found"
            )
        
        return CharacterResponse(
            id=str(character.id),
            name=character.name,
            description=character.description,
            user_id=str(character.user_id),
            metadata=character.metadata,
            is_public=character.is_public,
            created_at=character.created_at
        )
        
    except Exception as e:
        logger.error(f"Failed to get character: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get character"
        )

@router.put("/{character_id}", response_model=CharacterResponse)
async def update_character(
    character_id: str,
    character_data: CharacterUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """更新角色信息"""
    try:
        character = db.query(Character).filter(
            Character.id == character_id,
            Character.user_id == current_user.id
        ).first()
        
        if not character:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Character not found"
            )
        
        # 更新字段
        if character_data.name is not None:
            character.name = character_data.name
        if character_data.description is not None:
            character.description = character_data.description
        if character_data.metadata is not None:
            character.metadata = character_data.metadata
        if character_data.is_public is not None:
            character.is_public = character_data.is_public
        
        db.commit()
        db.refresh(character)
        
        logger.info(f"Character updated: {character.name} by user {current_user.email}")
        return CharacterResponse(
            id=str(character.id),
            name=character.name,
            description=character.description,
            user_id=str(character.user_id),
            metadata=character.metadata,
            is_public=character.is_public,
            created_at=character.created_at
        )
        
    except Exception as e:
        logger.error(f"Character update failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update character"
        )

@router.delete("/{character_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_character(
    character_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """删除角色"""
    try:
        character = db.query(Character).filter(
            Character.id == character_id,
            Character.user_id == current_user.id
        ).first()
        
        if not character:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Character not found"
            )
        
        db.delete(character)
        db.commit()
        
        logger.info(f"Character deleted: {character.name} by user {current_user.email}")
        
    except Exception as e:
        logger.error(f"Character deletion failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete character"
        ) 
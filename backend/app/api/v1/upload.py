from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from ...core.database import get_db
from ...models.character import Character, CharacterImage
from ...schemas.upload import ImageUploadResponse, BatchUploadResponse
from typing import List
import uuid
import os

router = APIRouter()

@router.post("/character/{character_id}/images", response_model=BatchUploadResponse)
async def upload_character_images(
    character_id: str,
    files: List[UploadFile] = File(...),
    db: Session = Depends(get_db)
):
    """上传角色图片"""
    # 检查角色是否存在
    character = db.query(Character).filter(Character.id == character_id).first()
    if not character:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="角色不存在"
        )
    
    uploaded_images = []
    failed_files = []
    
    for file in files:
        try:
            # 生成文件名
            file_extension = os.path.splitext(file.filename)[1]
            new_filename = f"{uuid.uuid4()}{file_extension}"
            
            # 保存文件（这里简化处理，实际应该保存到MinIO等存储服务）
            file_path = f"uploads/{new_filename}"
            os.makedirs("uploads", exist_ok=True)
            
            with open(file_path, "wb") as buffer:
                content = await file.read()
                buffer.write(content)
            
            # 创建图片记录
            db_image = CharacterImage(
                character_id=character_id,
                image_url=file_path,
                image_type="reference",
                file_size=str(len(content)),
                mime_type=file.content_type
            )
            
            db.add(db_image)
            db.commit()
            db.refresh(db_image)
            
            uploaded_images.append(ImageUploadResponse(
                id=str(db_image.id),
                filename=file.filename,
                url=file_path,
                file_size=len(content),
                mime_type=file.content_type,
                quality_score=0.8,  # 模拟质量评分
                recommendations=["图片质量良好", "建议添加更多角度"]
            ))
            
        except Exception as e:
            failed_files.append(file.filename)
    
    return BatchUploadResponse(
        total_uploaded=len(uploaded_images),
        total_failed=len(failed_files),
        uploaded_images=uploaded_images,
        failed_files=failed_files
    )

@router.delete("/character/{character_id}/images/{image_id}")
async def delete_character_image(
    character_id: str,
    image_id: str,
    db: Session = Depends(get_db)
):
    """删除角色图片"""
    image = db.query(CharacterImage).filter(
        CharacterImage.id == image_id,
        CharacterImage.character_id == character_id
    ).first()
    
    if not image:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="图片不存在"
        )
    
    # 删除文件
    if os.path.exists(image.image_url):
        os.remove(image.image_url)
    
    # 删除数据库记录
    db.delete(image)
    db.commit()
    
    return {"message": "图片删除成功"} 
from fastapi import APIRouter, UploadFile, File
from pydantic import BaseModel
import pandas as pd
import io
import databutton as db
from datetime import datetime

router = APIRouter()

class IssueUploadResponse(BaseModel):
    success: bool
    message: str
    total_issues: int

@router.post('/upload-issues')
async def upload_capital_raiser_issues(file: UploadFile = File(...)) -> IssueUploadResponse:
    try:
        # Read the CSV content
        content = await file.read()
        df = pd.read_csv(io.StringIO(content.decode('utf-8')))
        
        # Add timestamp to the issues
        df['uploaded_at'] = datetime.now().isoformat()
        
        # Store the issues
        db.storage.dataframes.put('capital_raiser_issues', df)
        
        return IssueUploadResponse(
            success=True,
            message='Successfully uploaded and processed issues',
            total_issues=len(df)
        )
    except Exception as e:
        return IssueUploadResponse(
            success=False,
            message=f'Error processing file: {str(e)}',
            total_issues=0
        )

@router.get('/list-issues')
def list_capital_raiser_issues():
    try:
        df = db.storage.dataframes.get('capital_raiser_issues')
        return df.to_dict(orient='records')
    except:
        return []
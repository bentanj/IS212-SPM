from typing import Dict, Any, List, Optional
from datetime import datetime
from dataclasses import dataclass, asdict

@dataclass
class ReportMetadata:
    """Metadata for generated reports"""
    report_id: str
    report_type: str
    generated_at: datetime
    generated_by: Optional[str]
    parameters: Dict[str, Any]
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "report_id": self.report_id,
            "report_type": self.report_type,
            "generated_at": self.generated_at.isoformat(),
            "generated_by": self.generated_by,
            "parameters": self.parameters
        }

@dataclass
class ReportData:
    """Container for report data and metadata"""
    metadata: ReportMetadata
    data: Dict[str, Any]
    summary: Dict[str, Any]
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "metadata": self.metadata.to_dict(),
            "data": self.data,
            "summary": self.summary
        }

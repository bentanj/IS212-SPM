from dataclasses import dataclass
from datetime import datetime
from typing import Any, Dict

@dataclass
class ReportMetadata:
    """Metadata for a generated report"""
    report_id: str
    report_type: str
    generated_at: datetime
    generated_by: str
    parameters: Dict[str, Any]
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary with proper field names"""
        return {
            "report_id": self.report_id,
            "report_type": self.report_type,
            "generated_at": self.generated_at.isoformat(),
            "generated_by": self.generated_by,
            "parameters": self.parameters
        }

@dataclass
class ReportData:
    """Complete report data structure"""
    metadata: ReportMetadata
    summary: Dict[str, Any]
    data: Dict[str, Any]
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization"""
        return {
            "metadata": self.metadata.to_dict(),
            "summary": self.summary,
            "data": self.data
        }

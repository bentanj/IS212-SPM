# Models/Report.py
from dataclasses import dataclass, field, asdict
from datetime import datetime
from typing import Dict, Any, Optional

@dataclass
class ReportMetadata:
    """Metadata for report generation"""
    report_id: str
    report_type: str
    generated_at: datetime
    generated_by: str
    parameters: Dict[str, Any] = field(default_factory=dict)
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary with ISO formatted datetime"""
        return {
            "report_id": self.report_id,
            "report_type": self.report_type,
            "generated_at": self.generated_at.isoformat() + 'Z',
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

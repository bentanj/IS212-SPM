// src/app/reportgeneration/components/ReportCard.tsx
import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
  Stack,
  Box,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { PictureAsPdf, TableChart, Timer } from '@mui/icons-material';

interface ReportCardProps {
  report: {
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    category: string;
    estimatedTime: string;
    dataPoints: number;
    hasSubTypes?: boolean;
  };
  isExportingPDF: boolean;
  isExportingExcel: boolean;
  onExportPDF: () => void;
  onExportExcel: () => void;
  getCategoryColor: (category: string) => string;
  hasDateFilter?: boolean;
}

export const ReportCard: React.FC<ReportCardProps> = ({
  report,
  isExportingPDF,
  isExportingExcel,
  onExportPDF,
  onExportExcel,
  getCategoryColor,
  hasDateFilter = false,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Card
      elevation={2}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.3s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[8],
        },
      }}
    >
      <CardContent sx={{ flexGrow: 1, pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
          <Box
            sx={{
              mr: 2,
              p: 1.5,
              borderRadius: 2,
              bgcolor: 'primary.lighter',
              display: 'flex',
              color: 'primary.main',
            }}
          >
            {report.icon}
          </Box>
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography
              variant="h6"
              component="h3"
              gutterBottom
              sx={{
                fontSize: { xs: '1.1rem', sm: '1.25rem' },
                fontWeight: 600,
                lineHeight: 1.3,
              }}
            >
              {report.title}
            </Typography>
            <Chip
              label={report.category}
              color={getCategoryColor(report.category) as any}
              size="small"
              sx={{ fontSize: '0.75rem' }}
            />
          </Box>
        </Box>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: 2,
            display: { xs: 'none', sm: 'block' },
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {report.description}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: 2,
            display: { xs: 'block', sm: 'none' },
          }}
        >
          {report.description.substring(0, 120)}...
        </Typography>

        <Stack direction="row" spacing={2} sx={{ mt: 'auto' }}>
          <Chip
            icon={<Timer />}
            label={report.estimatedTime}
            size="small"
            variant="outlined"
          />
          <Typography variant="caption" color="text.secondary" sx={{ pt: 0.75 }}>
            {report.dataPoints} data points
          </Typography>
        </Stack>

        {hasDateFilter && (
          <Box sx={{ mt: 2 }}>
            <Chip
              label="Date Filtered"
              color="info"
              size="small"
              variant="outlined"
            />
          </Box>
        )}

        {report.hasSubTypes && (
          <Box sx={{ mt: 2 }}>
            <Chip
              label="Multiple Options"
              color="secondary"
              size="small"
              variant="outlined"
            />
          </Box>
        )}
      </CardContent>

      <CardActions sx={{ px: 2, pb: 2, pt: 1 }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1}
          sx={{ width: '100%' }}
        >
          <Button
            variant="contained"
            startIcon={<PictureAsPdf />}
            onClick={onExportPDF}
            disabled={isExportingPDF}
            fullWidth={isMobile}
            sx={{
              py: { xs: 1, sm: 1.25 },
              fontSize: { xs: '0.875rem', sm: '0.938rem' },
              minWidth: { sm: 140 },
            }}
          >
            {isExportingPDF ? 'Exporting...' : 'Export to PDF'}
          </Button>

          <Button
            variant="outlined"
            startIcon={<TableChart />}
            onClick={onExportExcel}
            disabled={isExportingExcel}
            fullWidth={isMobile}
            sx={{
              py: { xs: 1, sm: 1.25 },
              fontSize: { xs: '0.875rem', sm: '0.938rem' },
              minWidth: { sm: 140 },
            }}
          >
            {isExportingExcel ? 'Exporting...' : 'Export to Excel'}
          </Button>
        </Stack>
      </CardActions>
    </Card>
  );
};

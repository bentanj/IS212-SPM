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
  Tooltip,
} from '@mui/material';
import { PictureAsPdf, TableChart, Timer, LockOutlined } from '@mui/icons-material';

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
  isDisabled?: boolean;
}

export const ReportCard: React.FC<ReportCardProps> = ({
  report,
  isExportingPDF,
  isExportingExcel,
  onExportPDF,
  onExportExcel,
  getCategoryColor,
  hasDateFilter = false,
  isDisabled = false,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const renderButton = (
    button: React.ReactNode,
    tooltipText: string,
    disabled: boolean
  ) => {
    if (disabled && isDisabled) {
      return (
        <Tooltip title={tooltipText} arrow>
          <span style={{ width: isMobile ? '100%' : 'auto' }}>{button}</span>
        </Tooltip>
      );
    }
    return button;
  };

  return (
    <Card
      elevation={2}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.3s ease-in-out',
        opacity: isDisabled ? 0.7 : 1,
        '&:hover': {
          transform: isDisabled ? 'none' : 'translateY(-4px)',
          boxShadow: isDisabled ? theme.shadows[2] : theme.shadows[8],
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
              bgcolor: isDisabled ? 'action.disabledBackground' : 'primary.lighter',
              display: 'flex',
              color: isDisabled ? 'action.disabled' : 'primary.main',
            }}
          >
            {isDisabled ? <LockOutlined sx={{ fontSize: 28 }} /> : report.icon}
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

        <Stack direction="row" spacing={2} sx={{ mt: 'auto', flexWrap: 'wrap', gap: 1 }}>
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

        <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: 'wrap', gap: 1 }}>
          {hasDateFilter && (
            <Chip
              label="Date Filtered"
              color="success"
              size="small"
              variant="outlined"
            />
          )}

          {report.hasSubTypes && (
            <Chip
              label="Multiple Options"
              color="secondary"
              size="small"
              variant="outlined"
            />
          )}

          {isDisabled && (
            <Chip
              label="Date Range Required"
              color="warning"
              size="small"
              variant="filled"
            />
          )}
        </Stack>
      </CardContent>

      <CardActions sx={{ px: 2, pb: 2, pt: 1 }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1}
          sx={{ width: '100%' }}
        >
          {renderButton(
            <Button
              variant="contained"
              startIcon={<PictureAsPdf />}
              onClick={onExportPDF}
              disabled={isExportingPDF || isDisabled}
              fullWidth={isMobile}
              sx={{
                py: { xs: 1, sm: 1.25 },
                fontSize: { xs: '0.875rem', sm: '0.938rem' },
                minWidth: { sm: 140 },
              }}
            >
              {isExportingPDF ? 'Exporting...' : 'Export to PDF'}
            </Button>,
            'Please select a date range first',
            isDisabled
          )}

          {renderButton(
            <Button
              variant="outlined"
              startIcon={<TableChart />}
              onClick={onExportExcel}
              disabled={isExportingExcel || isDisabled}
              fullWidth={isMobile}
              sx={{
                py: { xs: 1, sm: 1.25 },
                fontSize: { xs: '0.875rem', sm: '0.938rem' },
                minWidth: { sm: 140 },
              }}
            >
              {isExportingExcel ? 'Exporting...' : 'Export to Excel'}
            </Button>,
            'Please select a date range first',
            isDisabled
          )}
        </Stack>
      </CardActions>
    </Card>
  );
};

// src/app/projects/page.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, CircularProgress } from '@mui/material';
import { ProjectsDataGrid } from './_components/ProjectsDataGrid';
import { SearchBar } from './_components/SearchBar';
import { FilterControls } from './_components/FilterControls';
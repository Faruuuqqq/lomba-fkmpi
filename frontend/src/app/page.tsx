'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { projectsAPI } from '@/lib/api';
import { Project } from '@/types';
import { 
  BookOpen, 
  Lock, 
  Bot, 
  Shield, 
  FileText
} from 'lucide-react';
import { 
  TrendingUp, 
  Activity, 
  Smartphone
} from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';
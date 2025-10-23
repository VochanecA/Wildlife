// components/daily-analysis-card.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Calendar, TrendingUp, AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from '@/components/ui/button';

interface DailyAnalysis {
  analysis: string;
  generated_at: string;
  periods: string[];
}

export function DailyAnalysisCard() {
  const [analysis, setAnalysis] = useState<DailyAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDailyAnalysis = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/ai/daily-analysis');
      if (!response.ok) {
        throw new Error('Greška pri učitavanju analize');
      }
      
      const data = await response.json();
      setAnalysis(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Došlo je do greške');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDailyAnalysis();
  }, []);

  const formatAnalysisText = (text: string) => {
    return text.split('\n').map((line, index) => {
      if (line.startsWith('**') && line.endsWith('**')) {
        return <div key={index} className="font-bold text-lg text-blue-800 mt-4 mb-2">{line.replace(/\*\*/g, '')}</div>;
      }
      if (line.startsWith('📊') || line.startsWith('🦅') || line.startsWith('⚠️') || line.startsWith('🔮')) {
        return <div key={index} className="font-semibold text-gray-800 mt-3 mb-1 flex items-center gap-2">{line}</div>;
      }
      if (line.startsWith('- ')) {
        return <div key={index} className="ml-4 text-gray-700">• {line.substring(2)}</div>;
      }
      if (line.trim() === '') {
        return <br key={index} />;
      }
      return <div key={index} className="text-gray-700 leading-relaxed">{line}</div>;
    });
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-t-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Brain className="w-5 h-5" />
            <div>
              <CardTitle className="text-white">Dnevna AI Analiza</CardTitle>
              <CardDescription className="text-purple-100">
                Automatski pregled podataka i trendova
              </CardDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchDailyAnalysis}
            disabled={isLoading}
            className="text-white hover:bg-white/20"
          >
            <RefreshCw className={`w-4 h-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
            Osvježi
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4 max-h-96 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <RefreshCw className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-2" />
              <p className="text-gray-500">AI analizira podatke...</p>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-600">
            <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
            <p>{error}</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchDailyAnalysis}
              className="mt-2"
            >
              Pokušaj ponovo
            </Button>
          </div>
        ) : analysis ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <Calendar className="w-3 h-3" />
                <span>Generisano: {new Date(analysis.generated_at).toLocaleString()}</span>
              </div>
              <div className="flex items-center space-x-1">
                <TrendingUp className="w-3 h-3" />
                <span>Periodi: {analysis.periods.slice(0, 3).join(', ')}...</span>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              {formatAnalysisText(analysis.analysis)}
            </div>
            
            <div className="text-xs text-gray-500 text-center">
              Analiza obuhvata podatke za poslednjih 2, 3, 7 dana, 1, 3, 6 mjeseci i godinu dana
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
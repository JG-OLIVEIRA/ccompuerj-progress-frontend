
"use client";

import { DisciplinesList } from './disciplines-list';
import type { Course } from '@/lib/courses';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';

type DisciplinesPageClientProps = {
  initialDisciplines: Course[];
};

export function DisciplinesPageClient({ initialDisciplines }: DisciplinesPageClientProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Lista de Disciplinas</CardTitle>
        <CardDescription>
        Visualize todas as disciplinas do curso de Ciência da Computação.
        </CardDescription>
      </CardHeader>
      <CardContent className='pt-4'>
        <DisciplinesList initialDisciplines={initialDisciplines} />
      </CardContent>
    </Card>
  );
}

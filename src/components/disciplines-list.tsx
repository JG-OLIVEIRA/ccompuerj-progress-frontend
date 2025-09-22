
"use client";

import { useState, useMemo, useContext } from 'react';
import type { Course } from '@/lib/courses';
import { Input } from './ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Search } from 'lucide-react';
import { Badge } from './ui/badge';
import { StudentContext, CourseStatus } from '@/contexts/student-context';
import { cn } from '@/lib/utils';

type DisciplinesListProps = {
  initialDisciplines: Course[];
};

const statusMap: Record<CourseStatus, { text: string, className: string }> = {
    COMPLETED: { text: 'Concluída', className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
    CURRENT: { text: 'Cursando', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200' },
    NOT_TAKEN: { text: 'Não Cursada', className: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200' },
    CAN_TAKE: { text: 'Não Cursada', className: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200' },
};


export function DisciplinesList({ initialDisciplines }: DisciplinesListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const { student, courseStatuses } = useContext(StudentContext)!;

  const sortedDisciplines = useMemo(() => {
    return [...initialDisciplines].sort((a, b) => {
        if (a.semester !== b.semester) {
            return (a.semester || 99) - (b.semester || 99);
        }
        return a.name.localeCompare(b.name);
    });
  }, [initialDisciplines]);

  const filteredDisciplines = useMemo(() => {
    if (!searchTerm) {
      return sortedDisciplines;
    }
    const lowercasedTerm = searchTerm.toLowerCase();
    return sortedDisciplines.filter(discipline =>
      discipline.name.toLowerCase().includes(lowercasedTerm) ||
      discipline.code.toLowerCase().includes(lowercasedTerm)
    );
  }, [sortedDisciplines, searchTerm]);

  return (
    <>
        <div className="relative px-6 pb-4">
            <Search className="absolute left-8 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
            type="text"
            placeholder="Buscar por nome ou código..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-8 w-full md:w-1/3"
            />
        </div>
      <div className="overflow-x-auto px-6">
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead className="text-center">Período</TableHead>
                <TableHead className="text-center">Créditos</TableHead>
                <TableHead>Categoria</TableHead>
                {student && <TableHead className="text-right">Situação</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDisciplines.length > 0 ? (
                filteredDisciplines.map(discipline => {
                  const status = courseStatuses[discipline.id] || 'NOT_TAKEN';
                  const statusInfo = statusMap[status];
                  return (
                    <TableRow key={discipline.id}>
                        <TableCell className="font-mono">{discipline.code}</TableCell>
                        <TableCell>{discipline.name}</TableCell>
                        <TableCell className="text-center">
                            {discipline.semester ? `${discipline.semester}º` : 'N/A'}
                        </TableCell>
                        <TableCell className="text-center">{discipline.credits}</TableCell>
                        <TableCell>
                            <Badge variant={discipline.category === 'Obrigatória' ? 'default' : 'secondary'}>
                                {discipline.category}
                            </Badge>
                        </TableCell>
                        {student && (
                            <TableCell className="text-right">
                                <Badge className={cn("border-transparent hover:opacity-80", statusInfo.className)}>
                                    {statusInfo.text}
                                </Badge>
                            </TableCell>
                        )}
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={student ? 6 : 5} className="text-center">
                    Nenhuma disciplina encontrada.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
}


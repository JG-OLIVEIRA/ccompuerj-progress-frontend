
"use client";

import { useContext, useState, useEffect } from 'react';
import { BookOpenCheck, RotateCw } from 'lucide-react';
import { StudentLogin } from '../student-login';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';

type ScrapeTimes = {
    lastDisciplineScrape: string | null;
    lastWhatsappScrape: string | null;
}

export function Header() {
  const pathname = usePathname();
  const [isScraping, setIsScraping] = useState(false);
  const [scrapeTimes, setScrapeTimes] = useState<ScrapeTimes>({ lastDisciplineScrape: null, lastWhatsappScrape: null });
  const { toast } = useToast();

  const navLinks = [
    { href: '/', label: 'Fluxograma' },
    { href: '/disciplines', label: 'Disciplinas' },
    { href: '/teachers', label: 'Professores' },
  ];

  const fetchScrapeTimes = async () => {
    try {
        const response = await fetch('/api/scrape-cache');
        if(response.ok) {
            const data: ScrapeTimes = await response.json();
            setScrapeTimes(data);
        }
    } catch (error) {
        console.error("Failed to fetch scrape times:", error);
    }
  }

  useEffect(() => {
    fetchScrapeTimes();
  }, []);

  const handleScrape = async () => {
    setIsScraping(true);
    try {
      const [disciplineResponse, whatsappResponse] = await Promise.all([
          fetch('/api/disciplines/actions/scrape', { method: 'POST' }),
          fetch('/api/disciplines/actions/scrape-whatsapp', { method: 'POST' })
      ]);

      if (disciplineResponse.status !== 202 || whatsappResponse.status !== 202) {
        throw new Error('Falha ao iniciar um dos processos de atualização.');
      }
      
      await fetchScrapeTimes();

      toast({
        title: 'Atualização Iniciada',
        description: `O processo de atualização de dados foi iniciado em segundo plano. Os dados estarão disponíveis em breve.`,
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Ocorreu um erro desconhecido.',
        variant: 'destructive',
      });
    } finally {
      setIsScraping(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Nunca';
    return dateString;
  }

  return (
    <header className="sticky top-0 z-20 w-full bg-background/80 backdrop-blur-sm border-b">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-3">
            <BookOpenCheck className="h-7 w-7 text-primary" />
            <h1 className="text-xl font-bold text-foreground tracking-tight hidden sm:inline-block">
              CCOMP UERJ
            </h1>
          </Link>
          <nav className="flex items-center gap-4">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  pathname === link.href ? "text-primary" : "text-muted-foreground"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-2">
           <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon">
                <RotateCw className={cn("h-4 w-4", isScraping && "animate-spin")} />
                <span className="sr-only">Atualizar Dados</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium leading-none">Sincronização de Dados</h4>
                  <p className="text-sm text-muted-foreground">
                    Força a atualização dos dados do Aluno Online e dos grupos de WhatsApp.
                  </p>
                </div>
                <div className="grid gap-2 text-sm">
                  <p>Disciplinas/Professores: <span className="font-mono text-muted-foreground">{formatDate(scrapeTimes.lastDisciplineScrape)}</span></p>
                  <p>Grupos de WhatsApp: <span className="font-mono text-muted-foreground">{formatDate(scrapeTimes.lastWhatsappScrape)}</span></p>
                </div>
                <Button onClick={handleScrape} disabled={isScraping} size="sm" className="w-full">
                  <RotateCw className={cn("mr-2 h-4 w-4", isScraping && "animate-spin")} />
                  {isScraping ? 'Atualizando...' : 'Atualizar Agora'}
                </Button>
              </div>
            </PopoverContent>
          </Popover>
          <StudentLogin />
        </div>
      </div>
    </header>
  );
}

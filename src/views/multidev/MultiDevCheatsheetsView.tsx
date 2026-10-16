import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  Copy,
  Check,
  Code2,
  ChevronDown,
  Layers,
  Sparkles,
  Terminal,
} from 'lucide-react';
import { TECH_CATALOG, getTechById } from '../../data/techCatalog';

interface CheatsheetSnippet {
  id: string;
  techId: string;
  topic: string;
  title: string;
  description: string;
  code: string;
}

const CHEATSHEETS: CheatsheetSnippet[] = [
  // C# Unity
  {
    id: 'cs-unity-coroutine',
    techId: 'csharp-unity',
    topic: 'Concorrência / Loops',
    title: 'Coroutine com Yield & WaitForSeconds cacheado',
    description: 'Evita alocação no Garbage Collector reutilizando instâncias de WaitForSeconds.',
    code: `private readonly WaitForSeconds _waitOneSecond = new WaitForSeconds(1.0f);

private IEnumerator TimerRoutine()
{
    while (true)
    {
        yield return _waitOneSecond;
        Debug.Log("1 segundo passou sem GC spike!");
    }
}`,
  },
  {
    id: 'cs-unity-singleton',
    techId: 'csharp-unity',
    topic: 'Arquitetura',
    title: 'Singleton Thread-Safe para MonoBehaviour',
    description: 'Padrão seguro de instância única com DontDestroyOnLoad.',
    code: `public abstract class Singleton<T> : MonoBehaviour where T : MonoBehaviour
{
    public static T Instance { get; private set; }

    protected virtual void Awake()
    {
        if (Instance != null && Instance != this)
        {
            Destroy(gameObject);
            return;
        }
        Instance = this as T;
        DontDestroyOnLoad(gameObject);
    }
}`,
  },
  // GDScript Godot
  {
    id: 'gd-signals',
    techId: 'gdscript-godot',
    topic: 'Eventos & Sinais',
    title: 'Definição e Conexão de Sinais Tipados',
    description: 'Comunicação desacoplada entre nós na Godot 4.',
    code: `signal health_changed(new_health: float, max_health: float)

@export var max_health: float = 100.0
var health: float = 100.0:
    set(value):
        health = clampf(value, 0.0, max_health)
        health_changed.emit(health, max_health)

func _ready() -> void:
    health_changed.connect(_on_health_changed)

func _on_health_changed(hp: float, max_hp: float) -> void:
    print("Vida atualizada: ", hp, "/", max_hp)`,
  },
  // C++ Unreal
  {
    id: 'cpp-unreal-uproperty',
    techId: 'cpp-unreal',
    topic: 'Reflexão & Inspector',
    title: 'Exposição de Propriedades e Funções para Blueprint',
    description: 'Macros de reflexão do Unreal Engine 5.',
    code: `UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Combat", meta = (ClampMin = "0.0"))
float AttackPower = 25.0f;

UFUNCTION(BlueprintCallable, Category = "Combat")
void ApplyDamageToTarget(AActor* TargetActor);`,
  },
  // Python
  {
    id: 'py-asyncio-taskgroup',
    techId: 'python-apps',
    topic: 'Concorrência / Async',
    title: 'AsyncIO TaskGroup (Python 3.11+)',
    description: 'Execução paralela estruturada e segura de múltiplas tarefas.',
    code: `import asyncio

async def fetch_data(id: int) -> dict:
    await asyncio.sleep(0.5)
    return {"id": id, "status": "ok"}

async def main():
    async with asyncio.TaskGroup() as tg:
        task1 = tg.create_task(fetch_data(1))
        task2 = tg.create_task(fetch_data(2))
    
    print(task1.result(), task2.result())

asyncio.run(main())`,
  },
  // Rust
  {
    id: 'rust-error-result',
    techId: 'rust-systems',
    topic: 'Tratamento de Erros',
    title: 'Tratamento Idiomático de Erros com Result e ?',
    description: 'Propagação limpa de erros sem unwrap() ou panic().',
    code: `use std::fs::File;
use std::io::{self, Read};

fn read_username_from_file(path: &str) -> Result<String, io::Error> {
    let mut file = File::open(path)?;
    let mut s = String::new();
    file.read_to_string(&mut s)?;
    Ok(s.trim().to_string())
}`,
  },
  // Go
  {
    id: 'go-worker-pool',
    techId: 'go-backend',
    topic: 'Concorrência',
    title: 'Pool de Workers com Canais e WaitGroup',
    description: 'Processamento paralelo seguro e com controle de encerramento.',
    code: `package main

import (
	"fmt"
	"sync"
)

func worker(id int, jobs <-chan int, results chan<- int, wg *sync.WaitGroup) {
	defer wg.Done()
	for j := range jobs {
		results <- j * 2
	}
}

func main() {
	var wg sync.WaitGroup
	jobs := make(chan int, 100)
	results := make(chan int, 100)

	for w := 1; w <= 3; w++ {
		wg.Add(1)
		go worker(w, jobs, results, &wg)
	}

	for j := 1; j <= 5; j++ {
		jobs <- j
	}
	close(jobs)
	wg.Wait()
	close(results)
}`,
  },
  // TypeScript
  {
    id: 'ts-discriminated-unions',
    techId: 'typescript-modern',
    topic: 'Tipagem Avançada',
    title: 'Discriminated Unions com Pattern Matching',
    description: 'Modelagem imutável de estados exaustivos.',
    code: `type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: Error };

function renderState<T>(state: AsyncState<T>): string {
  switch (state.status) {
    case 'idle': return 'Aguardando ação...';
    case 'loading': return 'Carregando...';
    case 'success': return \`Sucesso com \${JSON.stringify(state.data)}\`;
    case 'error': return \`Falha: \${state.error.message}\`;
  }
}`,
  },
  // PostgreSQL
  {
    id: 'pg-jsonb-indexing',
    techId: 'postgresql-advanced',
    topic: 'Indexação & JSONB',
    title: 'Criação de Tabela com JSONB e Índice GIN',
    description: 'Consultas ultra-rápidas em documentos JSON com PostgreSQL.',
    code: `CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) NOT NULL UNIQUE,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índice GIN para busca instantânea em chaves JSON
CREATE INDEX idx_user_profiles_metadata ON user_profiles USING GIN (metadata);

-- Consulta utilizando operador de contenção
SELECT * FROM user_profiles WHERE metadata @> '{"role": "admin", "active": true}';`,
  },
  // Flutter & Dart
  {
    id: 'flutter-riverpod-notifier',
    techId: 'flutter-dart',
    topic: 'Gerenciamento de Estado',
    title: 'StateNotifier / AsyncNotifier no Riverpod',
    description: 'Gestão reativa e desacoplada da interface no Flutter.',
    code: `import 'package:flutter_riverpod/flutter_riverpod.dart';

class CounterNotifier extends Notifier<int> {
  @override
  int build() => 0;

  void increment() => state++;
  void decrement() => state--;
}

final counterProvider = NotifierProvider<CounterNotifier, int>(CounterNotifier.new);`,
  },
];

interface MultiDevCheatsheetsViewProps {
  activeTechId: string;
  onSelectActiveTech: (techId: string) => void;
}

export const MultiDevCheatsheetsView: React.FC<MultiDevCheatsheetsViewProps> = ({
  activeTechId,
  onSelectActiveTech,
}) => {
  const currentTech = getTechById(activeTechId) || TECH_CATALOG[0];

  const [search, setSearch] = useState('');
  const [filterTech, setFilterTech] = useState<string>(activeTechId);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredSnippets = CHEATSHEETS.filter((item) => {
    const matchesTech = filterTech === 'all' || item.techId === filterTech;
    const matchesSearch =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.topic.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase()) ||
      item.code.toLowerCase().includes(search.toLowerCase());
    return matchesTech && matchesSearch;
  });

  const handleCopy = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-purple-400 uppercase tracking-wider">
            <BookOpen className="w-4 h-4" />
            <span>Documentação Rápida & Cheatsheets</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Snippets & Padrões Idiomáticos
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Acesso instantâneo a trechos testados de concorrência, arquitetura, I/O e APIs para cada ecossistema.
          </p>
        </div>

        {/* Filter controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <select
              value={filterTech}
              onChange={(e) => setFilterTech(e.target.value)}
              className="appearance-none pl-3.5 pr-8 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-xs font-medium text-white focus:outline-none focus:border-purple-500 cursor-pointer"
            >
              <option value="all">Todas as Linguagens</option>
              {TECH_CATALOG.map((tech) => (
                <option key={tech.id} value={tech.id}>
                  {tech.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-zinc-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar snippet por tópico, palavra-chave ou código..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700/80 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
        />
      </div>

      {/* Snippet Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredSnippets.map((snippet) => {
          const tech = getTechById(snippet.techId);
          return (
            <div
              key={snippet.id}
              className="rounded-2xl bg-zinc-900/90 border border-zinc-800 overflow-hidden shadow-xl flex flex-col justify-between"
            >
              <div className="p-5 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
                      {snippet.topic}
                    </span>
                    <h3 className="text-base font-bold text-white mt-1.5">{snippet.title}</h3>
                  </div>

                  {tech && (
                    <span className="text-xs px-2.5 py-1 rounded-lg bg-zinc-800 text-zinc-300 font-mono border border-zinc-700">
                      {tech.defaultExtension}
                    </span>
                  )}
                </div>

                <p className="text-xs text-zinc-400 leading-relaxed">{snippet.description}</p>
              </div>

              {/* Code Box */}
              <div className="bg-zinc-950 border-t border-zinc-800 relative group">
                <button
                  onClick={() => handleCopy(snippet.id, snippet.code)}
                  className="absolute right-3 top-3 p-1.5 rounded-lg bg-zinc-800/90 hover:bg-zinc-700 text-zinc-300 text-xs flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-all shadow-md z-10"
                >
                  {copiedId === snippet.id ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>{copiedId === snippet.id ? 'Copiado!' : 'Copiar'}</span>
                </button>

                <div className="p-4 overflow-x-auto max-h-56 overflow-y-auto font-mono text-xs text-zinc-200">
                  <pre>{snippet.code}</pre>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredSnippets.length === 0 && (
        <div className="p-12 text-center rounded-2xl bg-zinc-900/50 border border-zinc-800 text-zinc-400">
          <Code2 className="w-10 h-10 mx-auto text-zinc-600 mb-2" />
          <p className="text-sm font-semibold text-zinc-300">Nenhum snippet encontrado</p>
          <p className="text-xs text-zinc-500 mt-1">
            Experimente selecionar "Todas as Linguagens" ou alterar o termo pesquisado.
          </p>
        </div>
      )}
    </div>
  );
};

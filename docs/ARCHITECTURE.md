# ============================================
# docs/ARCHITECTURE.md
# ============================================

# Arquitetura - eProcesso Buscador

## Visão Geral

O eProcesso Buscador utiliza uma arquitetura em camadas que separa apresentação, lógica de negócio e acesso a dados.

```
┌─────────────────────────────────────┐
│       Camada de Apresentação        │
│  (Velocity Templates + HTML + CSS)  │
└─────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────┐
│      Camada de Lógica (Client)      │
│        (JavaScript Modules)         │
└─────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────┐
│        Camada de Dados              │
│        (Apache Solr)                │
└─────────────────────────────────────┘
```

## Componentes

### Frontend

#### Templates Velocity
- **Responsabilidade**: Renderização server-side
- **Localização**: `templates/`
- **Padrão**: Component-based architecture

#### JavaScript Modules
- **Responsabilidade**: Interatividade client-side
- **Localização**: `assets/js/`
- **Padrão**: Module Pattern (IIFE)

#### CSS
- **Responsabilidade**: Apresentação visual
- **Localização**: `assets/css/`
- **Padrão**: BEM + CSS Variables

### Backend

#### Apache Solr
- **Responsabilidade**: Indexação e busca
- **Versão**: 8.x+
- **Features**: Full-text search, faceting, highlighting

## Fluxo de Dados

### Busca Simples

```
User Input → SearchForm.js → Solr Query → Velocity Template → HTML Response
```

### Busca com Filtros

```
User Input → AdvancedFilters.js → Query Builder → 
SearchForm.js → Solr Query → Velocity Template → HTML Response
```

### Autocomplete

```
User Types → Autocomplete.js → Solr Terms API → 
jQuery UI → Suggestions Dropdown
```

## Decisões de Arquitetura

### Por que Velocity?

- Já utilizado no projeto original
- Integração nativa com Solr
- Performance server-side

### Por que Module Pattern?

- Encapsulamento de código
- Evita poluição do namespace global
- Compatível com navegadores antigos

### Por que CSS Variables?

- Facilita temas customizados
- Performance superior a pré-processadores
- Suporte nativo nos navegadores modernos

## Performance

### Otimizações Implementadas

1. **CSS**: Minificação e concatenação
2. **JavaScript**: Lazy loading de módulos
3. **Images**: Sprites e otimização
4. **Cache**: HTTP caching e service workers

### Métricas Alvo

- First Contentful Paint: < 1.5s
- Time to Interactive: < 3.5s
- Lighthouse Score: > 90

## Segurança

### Medidas Implementadas

1. **XSS Prevention**: Escape de outputs
2. **CSRF Protection**: Tokens em formulários
3. **Input Validation**: Client e server-side
4. **CSP**: Content Security Policy headers

## Escalabilidade

### Horizontal

- Load balancing de servidores Solr
- CDN para assets estáticos
- Cache distribuído

### Vertical

- Otimização de queries Solr
- Indexação incremental
- Sharding de collections

## Monitoramento

### Métricas Coletadas

- Performance de queries
- Taxa de erro
- Uso de recursos
- Comportamento do usuário

### Ferramentas

- Solr Admin UI
- Google Analytics
- Sentry (error tracking)
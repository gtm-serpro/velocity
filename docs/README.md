# ============================================
# docs/README.md
# ============================================

# eProcesso Buscador

Sistema de busca avançada para processos administrativos do eProcesso.

## 🎯 Características

- **Busca Full-Text**: Busca em todo o conteúdo dos documentos
- **Filtros Avançados**: Múltiplos critérios de busca
- **Navegação Facetada**: Refinamento por categorias
- **Autocomplete**: Sugestões inteligentes
- **Estatísticas**: Agregações de valores numéricos
- **Exportação**: XML, JSON e CSV
- **Responsivo**: Funciona em desktop e mobile

## 🚀 Início Rápido

### Pré-requisitos

- Apache Solr 8.x+
- Servidor Web (Apache/Nginx)
- Node.js 14+ (para desenvolvimento)

### Instalação

```bash
# Clone o repositório
git clone https://github.com/org/eprocesso-buscador.git
cd eprocesso-buscador

# Instale dependências
npm install

# Configure ambiente
cp .env.example .env
nano .env
```

### Desenvolvimento

```bash
# Inicie servidor de desenvolvimento
npm run dev

# Build de produção
npm run build
```

## 📁 Estrutura do Projeto

```
eprocesso-buscador/
├── templates/      # Templates Velocity
├── assets/         # CSS, JS e imagens
├── config/         # Configurações
└── docs/           # Documentação
```

## 🔧 Configuração

### Solr

Configure o endpoint do Solr em `.env`:

```
SOLR_BASE_URL=https://seu-servidor.com/solr/eprocesso
```

### Campos de Busca

Edite `config/field-labels.vm` para adicionar/modificar campos.

## 📖 Documentação

- [Arquitetura](ARCHITECTURE.md)
- [API JavaScript](API.md)
- [Guia de Contribuição](CONTRIBUTING.md)

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📝 Licença

Este projeto é proprietário da Receita Federal do Brasil.

## ✉️ Contato

Eduardo Saint Clair - eduardo.saintclair@serpro.gov.br
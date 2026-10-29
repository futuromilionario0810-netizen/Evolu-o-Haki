# Haki — Evolução diária

Aplicativo web instalável (PWA), em português, com tema escuro, verde claro, amarelo e vermelho para pontuação negativa.

## O que já funciona
- Pontuação total acumulada e título de evolução por marcos.
- Botões rápidos de + e − nos atributos e sub-habilidades.
- Navegação entre dias anteriores e visualização de registros.
- Histórico recente, dias com registro, melhor dia e sequência de dias.
- Metas progressivas de 10, 25, 50, 100, 200 e 365 pontos líquidos.
- Salvamento local no navegador e exportação JSON para backup.
- Manifest e service worker para instalação e funcionamento offline após o primeiro carregamento.

## Publicar na Vercel
1. Extraia este ZIP.
2. Envie os arquivos para um repositório GitHub **ou** use um fluxo de deploy estático suportado pela Vercel.
3. Na Vercel, importe o repositório. Não precisa de build command; deixe o diretório raiz como raiz do projeto.
4. Publique e abra a URL HTTPS gerada no Chrome do celular.
5. No Chrome, toque em `⋮` → `Adicionar à tela inicial` ou `Instalar app`, se aparecer.

## Importante sobre os dados
A pontuação fica salva no armazenamento local do navegador deste aparelho. Ela não sincroniza automaticamente com outros aparelhos e pode ser perdida se os dados do site forem apagados. Use **Exportar dados** para salvar um backup JSON.

## Regras configuradas
- Coragem: +1 ao enfrentar o medo; −2 ao recuar por medo.
- Autoestima: +1 ou −2.
- Vendas: Rapport, investigar necessidades e pedir indicações, cada um +1/−1.
- Conhecimento: +1 se cumprir aula de 1 hora e leitura de 10 páginas; −1 se não cumprir a regra completa.
- Disciplina: acordar às 5h30 e correr, cada um +1/−1.

A pontuação é manual. Registre uma vez por atitude/critério para evitar contar o mesmo acontecimento duas vezes.

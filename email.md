# Template Visual de Emails - Hooky

Este documento serve como referência oficial para todos os emails enviados pelo sistema (via Resend). Sempre que criar um novo e-mail ou editar um existente, siga estas especificações visuais.

## Cores e Estilo
- **Cor Primária:** `#FF6B6B` (Coral)
- **Fundo do Body:** `#f9f9f9`
- **Fundo do Card:** `#ffffff`
- **Bordas:** `1px solid #eeeeee`
- **Border Radius:** `20px` (Card principal), `12px` (Botões e caixas internas)
- **Fontes:** Sistema (-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, etc.)

## Estrutura HTML (Base)

```html
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background-color: #f9f9f9; margin: 0; padding: 40px 0; }
        .container { max-width: 440px; margin: 0 auto; background-color: #ffffff; border-radius: 20px; padding: 48px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05); border: 1px solid #eeeeee; }
        .logo { margin-bottom: 36px; text-align: left; }
        .title { font-size: 22px; font-weight: 600; color: #333333; margin-bottom: 28px; }
        .text { font-size: 15px; line-height: 22px; color: #333333; margin-bottom: 24px; }
        .feature-box { background-color: #f5f5f7; border-radius: 12px; padding: 20px; margin-bottom: 24px; }
        .button { display: inline-block; background-color: #FF6B6B; color: white !important; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 16px; }
        .footer-text { font-size: 14px; color: #666666; line-height: 20px; }
        .powered { text-align: left; margin-top: 24px; font-size: 11px; color: #9ca3af; }
    </style>
</head>
<body>
    <div class="container">
        <!-- Logo -->
        <div class="logo">
            <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 28px;">🎤</span>
                <span style="font-size: 20px; font-weight: 700; color: #FF6B6B;">Hooky</span>
            </div>
        </div>

        <!-- Conteúdo Dinâmico -->
        <h1 class="title">{{titulo}}</h1>
        <p class="text">
            {{mensagem}}
        </p>

        <!-- Botão de Ação (Opcional) -->
        <div style="text-align: center;">
            <a href="{{link}}" class="button">{{texto_botao}}</a>
        </div>

        <!-- Rodapé -->
        <p class="footer-text" style="margin-top: 24px;">
            {{texto_ajuda}}
        </p>
        <div class="powered">
            Powered by <span style="font-weight: 700; color: #FF6B6B; margin-left: 2px;">Hooky</span>
        </div>
    </div>
</body>
</html>
```

## Componentes Comuns

### Caixa de Recurso/Destaque (Feature Box)
```html
<div class="feature-box">
    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
        <span style="font-size: 18px;">✨</span>
        <span style="font-size: 14px; color: #333;">Texto do destaque</span>
    </div>
</div>
```

### Caixa de Código/Verificação
```html
<div style="background-color: #f5f5f7; border: 1px solid #e5e7eb; border-radius: 8px; padding: 24px; text-align: center; margin-bottom: 24px;">
    <span style="font-size: 38px; font-weight: 400; letter-spacing: 4px; color: #111111;">{{codigo}}</span>
</div>
```

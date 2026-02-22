const LOGO_SVG = `<svg version="1.2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="32" height="32"><path fill="#1860fb" d="m118.8 111.3l47.7 28.7-83.4 50-50.1-28.6z"/><path fill="#1860fb" d="m33 60.6l51.8 28.7v100.7l-51.8-28.7z"/><path fill="#1860fb" d="m118.8 11.2l47.7 28.8v100.9l-47.7-28.8z"/><path fill="#1860fb" d="m118 11.5l47.2 28.6-82.6 50.1-49.6-28.6z"/></svg>`;

export function emailLayout(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background-color:#f5f4f3;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f4f3;padding:40px 20px;">
    <tr>
      <td align="center">
        <!-- Logo -->
        <table role="presentation" width="480" cellpadding="0" cellspacing="0">
          <tr>
            <td align="center" style="padding:0 0 24px;">
              ${LOGO_SVG}
            </td>
          </tr>
        </table>
        <!-- Card -->
        <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;border:1px solid #e5e1dd;">
          ${content}
        </table>
        <!-- Footer -->
        <table role="presentation" width="480" cellpadding="0" cellspacing="0">
          <tr>
            <td align="center" style="padding:24px 0 0;">
              <p style="margin:0;font-size:12px;color:#726b65;">CoderScreen</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function emailButton(href: string, label: string): string {
  return `<a href="${href}" style="display:inline-block;padding:10px 24px;background-color:#1860fb;color:#ffffff;font-size:14px;font-weight:500;text-decoration:none;border-radius:6px;">${label}</a>`;
}

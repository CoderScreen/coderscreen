interface SignupFeedbackEmailParams {
  user_name: string;
}

export function buildSignupFeedbackEmail(params: SignupFeedbackEmailParams) {
  const firstName = params.user_name.split(' ')[0];

  return {
    subject: 'Quick question about CoderScreen',
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:20px;font-size:15px;line-height:24px;color:#1a1a1a;">
    <p>Hey ${firstName},</p>
    <p>It's Kuba, one of the founders of CoderScreen. I noticed you signed up about a week ago and wanted to reach out personally.</p>
    <p>I'd love to hear how things are going — whether you've had a chance to run any interviews, or if anything felt confusing or missing.</p>
    <p>No pressure at all, but if you have a minute, just hit reply and let me know:</p>
    <ul style="padding-left:20px;">
      <li>What made you try CoderScreen?</li>
      <li>Is there anything that didn't work the way you expected?</li>
      <li>What would make it more useful for you?</li>
    </ul>
    <p>Even a one-liner helps a ton. We're a small team and genuinely read every response.</p>
    <p>Thanks for giving us a shot!</p>
    <p>Kuba</p>
  </div>
</body>
</html>`,
  };
}

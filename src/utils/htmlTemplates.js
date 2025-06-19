export const signUpTemp = (link) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Activate Your Account</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: Arial, sans-serif;
      background-color: #f7f7f7;
      color: #333;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background: #ffffff;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 0 10px rgba(0,0,0,0.1);
    }
    .header {
      text-align: center;
      padding: 20px;
      background: linear-gradient(90deg, #6a11cb, #2575fc);
      border-radius: 8px;
      margin-bottom: 20px;
    }
    .header h1 {
      font-size: 42px;
      color: #ffffff;
      font-weight: bold;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
      letter-spacing: 3px;
      margin: 0;
    }
    .content {
      text-align: center;
      padding: 20px;
    }
    .content h1 {
      font-size: 28px;
      margin-bottom: 20px;
    }
    .content h2 {
      font-size: 32px;
      margin-bottom: 20px;
      color: #2575fc;
    }
    .content p {
      font-size: 16px;
      line-height: 1.5;
      margin: 0 0 20px 0;
    }
    .btn {
      display: inline-block;
      padding: 15px 30px;
      /* Matching gradient background for the button */
      background: linear-gradient(90deg, #6a11cb, #2575fc);
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 5px;
      font-size: 16px;
      font-weight: bold;
      letter-spacing: 2px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.2);
      transition: transform 0.2s ease-in-out;
    }
    .btn:hover {
      transform: translateY(-2px);
    }
    .footer {
      background-color: #f7f7f7;
      padding: 15px;
      text-align: center;
      font-size: 12px;
      color: #888;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>DiagnoSys</h1>
    </div>
    <div class="content">
      <h2>Welcome</h2>
      <p>We're excited to have you with us. Click the button below to activate your account.</p>
      <a class="btn" href="${link}">Activate Account</a>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} DiagnoSys. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;

export const resetPassTemp = (code) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Reset Your Password</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    /* Global Reset and Base Styles */
    body, html {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      font-family: Arial, sans-serif;
      background-color: #f7f7f7;
      color: #333;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background: #fff;
      border-radius: 8px;
      box-shadow: 0 0 10px rgba(0,0,0,0.1);
      overflow: hidden;
    }
    .header {
      background: linear-gradient(90deg, #6a11cb, #2575fc);
      padding: 20px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 42px;
      color: #fff;
      font-weight: bold;
      letter-spacing: 3px;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
    }
    .content {
      padding: 30px 20px;
      text-align: center;
    }
    .content h2 {
      font-size: 32px;
      margin-bottom: 20px;
      color: #2575fc;
    }
    .content p {
      font-size: 16px;
      line-height: 1.5;
      margin-bottom: 30px;
    }
    .code-box {
      display: inline-block;
      padding: 15px 30px;
      background: linear-gradient(90deg, #6a11cb, #2575fc);
      color: #ffffff !important;
      font-size: 18px;
      font-weight: bold;
      letter-spacing: 2px;
      border-radius: 5px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.2);
      cursor: default;
    }
    .footer {
      background-color: #f7f7f7;
      padding: 15px;
      text-align: center;
      font-size: 12px;
      color: #888;
    }
    @media (max-width: 480px) {
      .header h1 {
        font-size: 32px;
      }
      .content h2 {
        font-size: 26px;
      }
      .content p {
        font-size: 14px;
      }
      .code-box {
        font-size: 16px;
        padding: 12px 25px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>DiagnoSys</h1>
    </div>
    <div class="content">
      <h2>Reset Your Password</h2>
      <p>We received a request to reset your password. Please use the code below to complete the process.</p>
      <div class="code-box">${code}</div>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} DiagnoSys. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;
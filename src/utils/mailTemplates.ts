export const approvalEmailContent = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Product Approval Notification</title>
<style>
  body {
    font-family: Arial, sans-serif;
    margin: 0;
    padding: 0;
    background-color: #f4f4f4;
  }
  .container {
    max-width: 600px;
    margin: 20px auto;
    padding: 20px;
    background-color: #fff;
    border-radius: 5px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  }
  h1 {
    color: #333;
  }
  p {
    color: #666;
    line-height: 1.6;
  }
  .footer {
    margin-top: 20px;
    border-top: 1px solid #ddd;
    padding-top: 10px;
    text-align: center;
    color: #999;
    font-size: 0.8em;
  }
</style>
</head>
<body>
  <div class="container">
    <h1>Product Approval Notification</h1>
    <p>Hello,</p>
    <p>We are pleased to inform you that your product({0}) has been approved for selling.</p>
    <p>You can now proceed with listing your product on SWIFTBID.</p>
    <p>Thank you for choosing our platform for selling your product.</p>
    <div class="footer">
      <p>This is an automated message. Please do not reply.</p>
    </div>
  </div>
</body>
</html>
`
export const rejectionEmailContent = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Product Rejectionn Notification</title>
<style>
  body {
    font-family: Arial, sans-serif;
    margin: 0;
    padding: 0;
    background-color: #f4f4f4;
  }
  .container {
    max-width: 600px;
    margin: 20px auto;
    padding: 20px;
    background-color: #fff;
    border-radius: 5px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  }
  h1 {
    color: #333;
  }
  p {
    color: #666;
    line-height: 1.6;
  }
  .footer {
    margin-top: 20px;
    border-top: 1px solid #ddd;
    padding-top: 10px;
    text-align: center;
    color: #999;
    font-size: 0.8em;
  }
</style>
</head>
<body>
  <div class="container">
    <h1>Product Rejected Notification</h1>
    <p>Hello,</p>
    <p>We are sorry to inform you that your product({0}) has been rejected for selling for the following reason.</p>
    <p>{reason}</p><br/>
    <p>Re upload the product after doing neccesary actions.</p>
    <p>Thank you for choosing our platform for selling your product.</p>
    <div class="footer">
      <p>This is an automated message. Please do not reply.</p>
    </div>
  </div>
</body>
</html>
`

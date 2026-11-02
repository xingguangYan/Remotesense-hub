function layout(title: string, bodyHtml: string): string {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${title}</title></head>
<body style="margin:0;padding:0;background-color:#F8FAFC;font-family:'PingFang SC','Microsoft YaHei',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(15,23,42,0.08);">
        <tr><td style="background-color:#1E3A8A;padding:20px 24px;color:#ffffff;font-size:18px;font-weight:bold;">RemoteSense Hub</td></tr>
        <tr><td style="padding:24px;color:#0F172A;font-size:14px;line-height:1.7;">${bodyHtml}</td></tr>
        <tr><td style="padding:16px 24px 24px;color:#64748B;font-size:12px;border-top:1px solid #E2E8F0;">本邮件由 RemoteSense Hub 系统自动发送，请勿直接回复。如非本人操作，请忽略此邮件。</td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

function button(url: string, text: string): string {
  return `<a href="${url}" style="display:inline-block;background-color:#0EA5E9;color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;padding:12px 24px;border-radius:6px;margin:8px 4px 8px 0;">${text}</a>`
}

export function verificationEmailHtml(params: {
  title: string
  verifyUrl: string
  manageUrl: string
}): string {
  return layout(
    "验证您的需求发布",
    `<p style="margin:0 0 12px;">您好，您在 RemoteSense Hub 发布了一条需求：</p>
     <p style="margin:0 0 16px;font-size:16px;font-weight:600;">「${params.title}」</p>
     <p style="margin:0 0 8px;">点击下方按钮确认发布，确认后需求将公开展示：</p>
     ${button(params.verifyUrl, "确认发布")}
     <p style="margin:16px 0 8px;">您还可以通过此链接随时管理（查看状态 / 编辑 / 关闭）该需求：</p>
     ${button(params.manageUrl, "管理我的需求")}
     <p style="margin:16px 0 0;color:#64748B;">验证链接 24 小时内有效，超时未验证的需求将被自动标记为失效。链接地址：<br>${params.verifyUrl}</p>`,
  )
}

export function inquiryNotificationHtml(params: {
  demandTitle: string
  name: string
  phone: string
  email: string
  message: string
  demandUrl: string
}): string {
  return layout(
    "收到一条服务方意向",
    `<p style="margin:0 0 12px;">有服务方对您的需求表示感兴趣：</p>
     <p style="margin:0 0 16px;font-size:16px;font-weight:600;">「${params.demandTitle}」</p>
     <table cellpadding="0" cellspacing="0" style="width:100%;font-size:14px;margin-bottom:16px;">
       <tr><td style="padding:4px 0;color:#64748B;width:72px;">联系人</td><td style="padding:4px 0;">${params.name}</td></tr>
       <tr><td style="padding:4px 0;color:#64748B;">电话</td><td style="padding:4px 0;">${params.phone}</td></tr>
       <tr><td style="padding:4px 0;color:#64748B;">邮箱</td><td style="padding:4px 0;">${params.email}</td></tr>
     </table>
     <p style="margin:0 0 16px;color:#64748B;">服务方案：</p>
     <p style="margin:0 0 16px;background-color:#F1F5F9;padding:12px;border-radius:6px;">${params.message}</p>
     <p style="margin:0;color:#64748B;">请直接通过以上联系方式与服务方对接。</p>`,
  )
}

export function manualRelayHtml(params: {
  demandTitle: string
  name: string
  phone: string
  email: string
  message: string
}): string {
  return layout(
    "【需人工转达】新合作意向",
    `<p style="margin:0 0 12px;">一条新合作意向已提交，但需求方未开启「允许直接联系」，需人工转达：</p>
     <p style="margin:0 0 16px;font-size:16px;font-weight:600;">需求：${params.demandTitle}</p>
     <table cellpadding="0" cellspacing="0" style="width:100%;font-size:14px;">
       <tr><td style="padding:4px 0;color:#64748B;width:72px;">联系人</td><td style="padding:4px 0;">${params.name}</td></tr>
       <tr><td style="padding:4px 0;color:#64748B;">电话</td><td style="padding:4px 0;">${params.phone}</td></tr>
       <tr><td style="padding:4px 0;color:#64748B;">邮箱</td><td style="padding:4px 0;">${params.email}</td></tr>
     </table>
     <p style="margin:12px 0 0;color:#64748B;">服务方案：${params.message}</p>`,
  )
}

export function cooperationNotificationHtml(params: {
  name: string
  company: string
  phone: string
  email: string
  message: string
}): string {
  return layout(
    "新的商务合作咨询",
    `<p style="margin:0 0 16px;">收到一条新的商务合作咨询：</p>
     <table cellpadding="0" cellspacing="0" style="width:100%;font-size:14px;">
       <tr><td style="padding:4px 0;color:#64748B;width:72px;">姓名</td><td style="padding:4px 0;">${params.name}</td></tr>
       <tr><td style="padding:4px 0;color:#64748B;">公司</td><td style="padding:4px 0;">${params.company || "未填写"}</td></tr>
       <tr><td style="padding:4px 0;color:#64748B;">电话</td><td style="padding:4px 0;">${params.phone || "未填写"}</td></tr>
       <tr><td style="padding:4px 0;color:#64748B;">邮箱</td><td style="padding:4px 0;">${params.email}</td></tr>
     </table>
     <p style="margin:12px 0 0;color:#64748B;">合作意向：</p>
     <p style="margin:8px 0 0;background-color:#F1F5F9;padding:12px;border-radius:6px;">${params.message}</p>`,
  )
}

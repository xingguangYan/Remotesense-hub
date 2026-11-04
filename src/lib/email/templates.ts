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

/** 新需求上线 → 通知平台管理员（接收方：COOPERATION_EMAIL） */
export function newDemandNotifyHtml(params: {
  title: string
  category: string
  region: string
  budget: string | null
  contactName: string
  contactPhone: string
  contactEmail: string
  demandUrl: string
  adminUrl: string
}): string {
  const row = (label: string, value: string) =>
    `<tr><td style="padding:4px 0;color:#64748B;width:96px;">${label}</td><td style="padding:4px 0;">${value || "未填写"}</td></tr>`
  return layout(
    "新需求已上线",
    `<p style="margin:0 0 12px;">一条新需求已直接发布到需求大厅，请您及时审核：</p>
     <p style="margin:0 0 16px;font-size:16px;font-weight:600;">「${params.title}」</p>
     <table cellpadding="0" cellspacing="0" style="width:100%;font-size:14px;margin-bottom:16px;">
       ${row("需求类型", params.category)}
       ${row("目标区域", params.region)}
       ${row("预算区间", params.budget || "")}
       ${row("联系人", params.contactName)}
       ${row("手机号", params.contactPhone)}
       ${row("邮箱", params.contactEmail)}
     </table>
     ${button(params.demandUrl, "查看需求")}
     ${button(params.adminUrl, "前往管理后台")}
     <p style="margin:16px 0 0;color:#64748B;">提醒：该需求已直接上线，如内容不合规请及时在管理后台下架。</p>`,
  )
}

/** 新服务方意向 → 通知平台管理员，由平台撮合双方对接 */
export function newInquiryNotifyHtml(params: {
  demandTitle: string
  name: string
  phone: string
  email: string
  message: string
  demandOwnerName: string
  demandOwnerPhone: string
  demandOwnerEmail: string
  demandUrl: string
}): string {
  const row = (label: string, value: string) =>
    `<tr><td style="padding:4px 0;color:#64748B;width:96px;">${label}</td><td style="padding:4px 0;">${value || "未填写"}</td></tr>`
  return layout(
    "新服务方意向",
    `<p style="margin:0 0 12px;">有服务方对需求提交了合作意向，请审核并撮合双方对接：</p>
     <p style="margin:0 0 16px;font-size:16px;font-weight:600;">需求：${params.demandTitle}</p>
     <p style="margin:0 0 12px;color:#64748B;font-weight:600;">服务方信息</p>
     <table cellpadding="0" cellspacing="0" style="width:100%;font-size:14px;margin-bottom:12px;">
       ${row("联系人", params.name)}
       ${row("手机号", params.phone)}
       ${row("邮箱", params.email)}
     </table>
     <p style="margin:0 0 12px;color:#64748B;font-weight:600;">需求方信息</p>
     <table cellpadding="0" cellspacing="0" style="width:100%;font-size:14px;margin-bottom:16px;">
       ${row("联系人", params.demandOwnerName)}
       ${row("手机号", params.demandOwnerPhone)}
       ${row("邮箱", params.demandOwnerEmail)}
     </table>
     <p style="margin:0 0 16px;color:#64748B;">服务方案：</p>
     <p style="margin:0 0 16px;background-color:#F1F5F9;padding:12px;border-radius:6px;">${params.message}</p>
     ${button(params.demandUrl, "查看需求详情")}`,
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

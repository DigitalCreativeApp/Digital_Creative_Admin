const groups: Record<string, string[]> = {
  'Tài khoản & hồ sơ': ['accounts','users','companyprofiles','usersettings','userdevices','userpresences','professions','userprofessions','skills','userskills','socialplatforms','usersocialaccounts','socialaccountsnapshots','userfollows','userblocks','searchhistory'],
  'Nội dung sáng tạo': ['services','servicemedia','portfolioprojects','portfoliomedia','portfoliolikes','portfolioviews','inspirationcategories','inspirationposts','inspirationlikes','inspirationsaves','inspirationviews','fileassets'],
  'Dự án & đơn hàng': ['projects','projectapplications','projectproposals','projectassignments','projectmilestones','projectdeliverables','projectdeliverableassets','serviceorders','serviceorderpayments','serviceorderdeliverables','serviceorderdeliverableassets'],
  'Tài chính & tranh chấp': ['wallets','wallettransactions','walletbankaccounts','depositrequests','withdrawalrequests','projectpayments','disputes','disputeevidence'],
  'Giao tiếp & vận hành': ['conversations','conversationmembers','messages','messageattachments','messagereferences','reviews','notifications','reports','campaigns','campaignparticipants'],
  'Hệ thống & tích hợp': ['refreshtokens','auditlogs','outboxmessages','paymentwebhookevents','idempotencyrecords','passwordresettokens']
};
export function resourceGroup(key: string) { return Object.entries(groups).find(([, keys]) => keys.includes(key))?.[0] || 'Khác'; }

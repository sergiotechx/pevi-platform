export type UserRole = "corporation" | "beneficiary" | "evaluator" | "verifier" | "angel_investor"

export interface User {
  id: string
  email: string
  password?: string
  name: string
  role: UserRole
  walletAddress?: string
  orgId?: number
}

export interface Milestone {
  id: string
  title: string
  description: string
  reward: number
  status: "pending" | "in_progress" | "submitted" | "approved" | "rejected"
  evidenceUrl?: string
}

export interface Campaign {
  id: string
  name: string
  description: string
  objectives: string
  corporationId: string
  corporationName: string
  budget: number
  currency: string
  status: "draft" | "published" | "active" | "completed" | "paused"
  startDate: string
  endDate: string
  beneficiaries: string[]
  evaluatorId?: string
  verifierId?: string
  milestones: Milestone[]
}

export interface Evidence {
  id: string
  milestoneId: string
  campaignId: string
  beneficiaryId: string
  description: string
  fileUrl: string
  submittedAt: string
  status: "pending" | "approved" | "rejected"
}

export interface Evaluation {
  id: string
  evidenceId: string
  evaluatorId: string
  decision: "approved" | "rejected"
  comment: string
  evaluatedAt: string
  verificationStatus: "pending" | "verified" | "disputed"
}

export interface Notification {
  id: string
  userId: string
  title: string
  message: string
  type: "milestone" | "campaign" | "evaluation" | "verification" | "system" | "wallet"
  read: boolean
  metadata?: Record<string, any> | null
  createdAt: string
  actionUrl?: string
  actionLabel?: string
}

export interface Invitation {
  id: string
  campaignId: string
  beneficiaryId: string
  status: "pending" | "accepted" | "declined"
  invitedAt: string
}

export const invitations: Invitation[] = [
  { id: "inv1", campaignId: "c1", beneficiaryId: "u7", status: "pending", invitedAt: "2026-02-10" },
  { id: "inv2", campaignId: "c3", beneficiaryId: "u2", status: "pending", invitedAt: "2026-03-15" },
]

export const users: User[] = [
  { id: "u1", email: "corp@pevi.com", password: "password", name: "Stellar Corp", role: "corporation", walletAddress: "GCORP...XLMADDR1" },
  { id: "u2", email: "ben@pevi.com", password: "password", name: "Maria Garcia", role: "beneficiary", walletAddress: "GBEN1...XLMADDR2" },
  { id: "u3", email: "eval@pevi.com", password: "password", name: "Carlos Mendez", role: "evaluator", walletAddress: "GEVAL...XLMADDR3" },
  { id: "u4", email: "ver@pevi.com", password: "password", name: "Ana Torres", role: "verifier", walletAddress: "GVER1...XLMADDR4" },
  { id: "u5", email: "angel@pevi.com", password: "password", name: "David Chen", role: "angel_investor", walletAddress: "GANG1...XLMADDR5" },
  { id: "u6", email: "ben2@pevi.com", password: "password", name: "Luis Hernandez", role: "beneficiary" },
  { id: "u7", email: "ben3@pevi.com", password: "password", name: "Sofia Ramirez", role: "beneficiary" },
]

export const campaigns: Campaign[] = [
  {
    id: "c1",
    name: "Green Energy Initiative",
    description: "Incentive program for small businesses transitioning to renewable energy sources.",
    objectives: "Transition 50+ small businesses to at least 80% renewable energy usage within 6 months.",
    corporationId: "u1",
    corporationName: "Stellar Corp",
    budget: 50000,
    currency: "USDC",
    status: "active",
    startDate: "2026-01-15",
    endDate: "2026-07-15",
    beneficiaries: ["u2", "u6"],
    evaluatorId: "u3",
    verifierId: "u4",
    milestones: [
      { id: "m1", title: "Energy Audit Complete", description: "Complete initial energy audit", reward: 500, status: "approved", evidenceUrl: "audit-report.pdf" },
      { id: "m2", title: "Solar Panel Installation", description: "Install solar panels on premises", reward: 2000, status: "submitted", evidenceUrl: "installation-photos.zip" },
      { id: "m3", title: "Grid Connection", description: "Connect to renewable grid", reward: 1500, status: "in_progress" },
      { id: "m4", title: "Efficiency Report", description: "Submit 3-month efficiency report", reward: 1000, status: "pending" },
    ],
  },
  {
    id: "c2",
    name: "Digital Skills Academy",
    description: "Training program for digital skills development.",
    objectives: "Train 100 individuals in full-stack web development within 7 months.",
    corporationId: "u1",
    corporationName: "Stellar Corp",
    budget: 35000,
    currency: "USDC",
    status: "active",
    startDate: "2026-02-01",
    endDate: "2026-08-31",
    beneficiaries: ["u2", "u7"],
    evaluatorId: "u3",
    verifierId: "u4",
    milestones: [
      { id: "m5", title: "HTML/CSS Certification", description: "Complete web fundamentals", reward: 300, status: "approved" },
      { id: "m6", title: "JavaScript Proficiency", description: "Pass JS assessment", reward: 500, status: "submitted" },
      { id: "m7", title: "React Project", description: "Build and deploy a React app", reward: 800, status: "pending" },
    ],
  },
  {
    id: "c3",
    name: "Community Health Program",
    description: "Health and wellness program for underserved communities.",
    objectives: "Improve health outcomes for 200+ community members through preventive screenings.",
    corporationId: "u1",
    corporationName: "Stellar Corp",
    budget: 25000,
    currency: "USDC",
    status: "draft",
    startDate: "2026-04-01",
    endDate: "2026-10-01",
    beneficiaries: [],
    milestones: [
      { id: "m8", title: "Health Screening", description: "Complete baseline screenings", reward: 400, status: "pending" },
      { id: "m9", title: "Fitness Program", description: "Complete 12-week fitness program", reward: 600, status: "pending" },
    ],
  },
]

export const evidences: Evidence[] = [
  { id: "e1", milestoneId: "m1", campaignId: "c1", beneficiaryId: "u2", description: "Energy audit report from certified inspector", fileUrl: "audit-report.pdf", submittedAt: "2026-02-10", status: "approved" },
  { id: "e2", milestoneId: "m2", campaignId: "c1", beneficiaryId: "u2", description: "Photos of installed solar panels", fileUrl: "solar-photos.zip", submittedAt: "2026-03-05", status: "pending" },
  { id: "e3", milestoneId: "m5", campaignId: "c2", beneficiaryId: "u2", description: "HTML/CSS certification from CodeAcademy", fileUrl: "cert-htmlcss.pdf", submittedAt: "2026-02-28", status: "approved" },
  { id: "e4", milestoneId: "m6", campaignId: "c2", beneficiaryId: "u2", description: "JavaScript assessment results - 92%", fileUrl: "js-assessment.pdf", submittedAt: "2026-03-20", status: "pending" },
]

export const evaluations: Evaluation[] = [
  { id: "ev1", evidenceId: "e1", evaluatorId: "u3", decision: "approved", comment: "Audit report is thorough and meets all criteria.", evaluatedAt: "2026-02-12", verificationStatus: "verified" },
  { id: "ev2", evidenceId: "e3", evaluatorId: "u3", decision: "approved", comment: "Valid certification confirmed.", evaluatedAt: "2026-03-02", verificationStatus: "verified" },
]

export const notifications: Notification[] = [
  // Corporation notifications
  { id: "n1", userId: "u1", title: "New Evidence Submitted", message: "Maria Garcia submitted evidence for Solar Panel Installation in Green Energy Initiative.", type: "evaluation", read: false, createdAt: "2026-03-05T10:30:00Z", actionUrl: "/dashboard/campaigns", actionLabel: "View Campaign" },
  { id: "n2", userId: "u1", title: "Milestone Approved", message: "Energy Audit Complete milestone was approved for Maria Garcia.", type: "milestone", read: true, createdAt: "2026-02-12T14:00:00Z", actionUrl: "/dashboard/campaigns", actionLabel: "View Details" },
  { id: "n3", userId: "u1", title: "Campaign Budget Alert", message: "Green Energy Initiative has used 40% of its allocated budget.", type: "campaign", read: false, createdAt: "2026-03-01T09:00:00Z", actionUrl: "/dashboard/campaigns", actionLabel: "Review Budget" },
  { id: "n4", userId: "u1", title: "New Evaluator Assigned", message: "Carlos Mendez has been assigned as evaluator for Digital Skills Academy.", type: "system", read: true, createdAt: "2026-02-01T08:00:00Z" },
  // Beneficiary notifications
  { id: "n5", userId: "u2", title: "Milestone Approved!", message: "Your Energy Audit Complete milestone has been approved. Reward: 500 USDC.", type: "milestone", read: false, createdAt: "2026-02-12T14:05:00Z", actionUrl: "/dashboard/progress", actionLabel: "View Progress" },
  { id: "n6", userId: "u2", title: "Evidence Under Review", message: "Your evidence for Solar Panel Installation is being reviewed by the evaluator.", type: "evaluation", read: false, createdAt: "2026-03-05T11:00:00Z", actionUrl: "/dashboard/evidence", actionLabel: "View Evidence" },
  { id: "n7", userId: "u2", title: "New Campaign Available", message: "Community Health Program is now accepting beneficiaries. Check it out!", type: "campaign", read: false, createdAt: "2026-03-15T09:00:00Z", actionUrl: "/dashboard/explore", actionLabel: "Explore" },
  { id: "n8", userId: "u2", title: "HTML/CSS Certification Approved", message: "Congratulations! Your HTML/CSS certification milestone has been verified.", type: "milestone", read: true, createdAt: "2026-03-02T16:00:00Z", actionUrl: "/dashboard/progress", actionLabel: "View Progress" },
  { id: "n9", userId: "u2", title: "Welcome to PEVI", message: "Your account has been created. Connect your Stellar wallet to start receiving rewards.", type: "wallet", read: true, createdAt: "2026-01-10T08:00:00Z", actionUrl: "/dashboard/profile", actionLabel: "Set Up Wallet" },
  // Evaluator notifications
  { id: "n10", userId: "u3", title: "New Evidence to Review", message: "Maria Garcia submitted evidence for Solar Panel Installation. Please review.", type: "evaluation", read: false, createdAt: "2026-03-05T10:35:00Z", actionUrl: "/dashboard/review", actionLabel: "Review Now" },
  { id: "n11", userId: "u3", title: "New Evidence to Review", message: "Maria Garcia submitted JavaScript assessment results for Digital Skills Academy.", type: "evaluation", read: false, createdAt: "2026-03-20T12:00:00Z", actionUrl: "/dashboard/review", actionLabel: "Review Now" },
  { id: "n12", userId: "u3", title: "Evaluation Verified", message: "Your approval of Energy Audit Complete has been verified by Ana Torres.", type: "verification", read: true, createdAt: "2026-02-13T10:00:00Z" },
  { id: "n13", userId: "u3", title: "Assigned to New Campaign", message: "You have been assigned as evaluator for Digital Skills Academy.", type: "campaign", read: true, createdAt: "2026-02-01T08:05:00Z", actionUrl: "/dashboard/review", actionLabel: "View Assignments" },
  // Verifier notifications
  { id: "n14", userId: "u4", title: "New Evaluation to Audit", message: "Carlos Mendez approved Energy Audit Complete. Please verify.", type: "verification", read: false, createdAt: "2026-02-12T15:00:00Z", actionUrl: "/dashboard/audit", actionLabel: "Audit Now" },
  { id: "n15", userId: "u4", title: "New Evaluation to Audit", message: "Carlos Mendez approved HTML/CSS Certification. Please verify.", type: "verification", read: false, createdAt: "2026-03-02T17:00:00Z", actionUrl: "/dashboard/audit", actionLabel: "Audit Now" },
  { id: "n16", userId: "u4", title: "Assigned as Verifier", message: "You have been assigned as verifier for Green Energy Initiative.", type: "campaign", read: true, createdAt: "2026-01-15T08:00:00Z" },
  // Angel Investor notifications
  { id: "n17", userId: "u5", title: "Campaign Progress Update", message: "Green Energy Initiative is 25% complete with 2 milestones finished.", type: "campaign", read: false, createdAt: "2026-03-10T09:00:00Z", actionUrl: "/dashboard/campaigns", actionLabel: "View Campaigns" },
  { id: "n18", userId: "u5", title: "New Campaign Created", message: "Community Health Program has been drafted. Budget: 25,000 USDC.", type: "campaign", read: true, createdAt: "2026-03-01T10:00:00Z", actionUrl: "/dashboard/campaigns", actionLabel: "View Campaign" },
]

export const payments = [
  { id: "p1", campaignId: "c1", beneficiaryId: "u2", milestoneId: "m1", amount: 500, currency: "USDC", status: "completed", paidAt: "2026-02-13" },
  { id: "p2", campaignId: "c2", beneficiaryId: "u2", milestoneId: "m5", amount: 300, currency: "USDC", status: "completed", paidAt: "2026-03-03" },
]

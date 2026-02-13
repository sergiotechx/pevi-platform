/**
 * Include configurations for Prisma queries
 * Defines 'basic' and 'full' relationship includes for each model
 */

/**
 * Organization includes
 */
export const organizationIncludes = {
  basic: {
    campaigns: true,
    organizationStaff: true,
  },
  full: {
    campaigns: {
      include: {
        milestones: true,
        campaignBeneficiaries: true,
      },
    },
    organizationStaff: {
      include: {
        user: true,
      },
    },
  },
}

/**
 * User includes
 */
export const userIncludes = {
  basic: {
    campaignBeneficiaries: true,
    organizationStaff: true,
  },
  full: {
    campaignBeneficiaries: {
      include: {
        campaign: true,
        activities: true,
      },
    },
    organizationStaff: {
      include: {
        organization: true,
      },
    },
  },
}

/**
 * Campaign includes
 */
export const campaignIncludes = {
  basic: {
    organization: true,
    milestones: true,
    campaignBeneficiaries: true,
    campaignStaff: true,
  },
  full: {
    organization: true,
    milestones: {
      include: {
        activities: true,
      },
    },
    campaignBeneficiaries: {
      include: {
        user: true,
        activities: true,
      },
    },
    campaignStaff: {
      include: {
        organizationStaff: {
          include: {
            user: true,
          },
        },
      },
    },
  },
}

/**
 * CampaignBeneficiary includes
 */
export const campaignBeneficiaryIncludes = {
  basic: {
    campaign: true,
    user: true,
    activities: true,
  },
  full: {
    campaign: {
      include: {
        organization: true,
        milestones: true,
      },
    },
    user: true,
    activities: {
      include: {
        milestone: true,
        award: true,
      },
    },
  },
}

/**
 * Milestone includes
 */
export const milestoneIncludes = {
  basic: {
    campaign: true,
    activities: true,
  },
  full: {
    campaign: {
      include: {
        organization: true,
      },
    },
    activities: {
      include: {
        campaignBeneficiary: {
          include: {
            user: true,
          },
        },
        award: true,
      },
    },
  },
}

/**
 * OrganizationStaff includes
 */
export const organizationStaffIncludes = {
  basic: {
    organization: true,
    user: true,
    campaignStaff: true,
  },
  full: {
    organization: {
      include: {
        campaigns: true,
      },
    },
    user: true,
    campaignStaff: {
      include: {
        campaign: true,
      },
    },
  },
}

/**
 * Activity includes
 */
export const activityIncludes = {
  basic: {
    milestone: true,
    campaignBeneficiary: true,
    award: true,
  },
  full: {
    milestone: {
      include: {
        campaign: {
          include: {
            organization: true,
          },
        },
      },
    },
    campaignBeneficiary: {
      include: {
        user: true,
        campaign: true,
      },
    },
    award: true,
  },
}

/**
 * Award includes
 */
export const awardIncludes = {
  basic: {
    activity: true,
  },
  full: {
    activity: {
      include: {
        milestone: {
          include: {
            campaign: true,
          },
        },
        campaignBeneficiary: {
          include: {
            user: true,
          },
        },
      },
    },
  },
}

/**
 * CampaignStaff includes
 */
export const campaignStaffIncludes = {
  basic: {
    campaign: true,
    organizationStaff: true,
  },
  full: {
    campaign: {
      include: {
        organization: true,
        milestones: true,
      },
    },
    organizationStaff: {
      include: {
        user: true,
        organization: true,
      },
    },
  },
}

/**
 * Helper function to get include configuration by model name and type
 */
export function getModelIncludes(
  modelName: string,
  includeType: 'basic' | 'full'
): Record<string, boolean | object> | undefined {
  const includesMap: Record<string, any> = {
    organization: organizationIncludes,
    user: userIncludes,
    campaign: campaignIncludes,
    campaignBeneficiary: campaignBeneficiaryIncludes,
    milestone: milestoneIncludes,
    organizationStaff: organizationStaffIncludes,
    activity: activityIncludes,
    award: awardIncludes,
    campaignStaff: campaignStaffIncludes,
  }

  const modelIncludes = includesMap[modelName]
  return modelIncludes ? modelIncludes[includeType] : undefined
}

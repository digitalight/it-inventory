import { PrismaClient } from "@prisma/client";

async function seedChecklistTemplates() {
  const prisma = new PrismaClient();

  try {
    console.log("🌱 Seeding checklist templates...");

    // Create Onboarding Template
    const onboardingTemplate = await prisma.checklistTemplate.create({
      data: {
        name: "Standard Onboarding",
        type: "onboarding",
        description: "Complete onboarding checklist for new staff members",
        isActive: true,
      },
    });

    console.log("✅ Created onboarding template:", onboardingTemplate.name);

    // Add onboarding checklist items
    const onboardingItems = [
      {
        title: "Create user account",
        description: "Set up Active Directory account and email",
        category: "IT Setup",
        order: 1,
        isRequired: true,
        estimatedTime: 30,
      },
      {
        title: "Assign laptop",
        description: "Allocate and configure laptop for new staff member",
        category: "IT Setup",
        order: 2,
        isRequired: true,
        estimatedTime: 60,
      },
      {
        title: "Install required software",
        description:
          "Install standard software package and department-specific applications",
        category: "IT Setup",
        order: 3,
        isRequired: true,
        estimatedTime: 45,
      },
      {
        title: "Setup network access",
        description: "Configure WiFi, VPN, and network drive access",
        category: "IT Setup",
        order: 4,
        isRequired: true,
        estimatedTime: 20,
      },
      {
        title: "Create HR file",
        description: "Set up personnel file and documentation",
        category: "HR",
        order: 5,
        isRequired: true,
        estimatedTime: 15,
      },
      {
        title: "Issue ID badge",
        description:
          "Create and provide staff ID badge with appropriate access levels",
        category: "Facilities",
        order: 6,
        isRequired: true,
        estimatedTime: 10,
      },
      {
        title: "Assign parking space",
        description: "Allocate parking space if required",
        category: "Facilities",
        order: 7,
        isRequired: false,
        estimatedTime: 5,
      },
      {
        title: "Setup desk and workspace",
        description: "Prepare workstation and office supplies",
        category: "Facilities",
        order: 8,
        isRequired: true,
        estimatedTime: 30,
      },
      {
        title: "Conduct security briefing",
        description: "Complete security orientation and policy review",
        category: "Security",
        order: 9,
        isRequired: true,
        estimatedTime: 30,
      },
      {
        title: "Department introduction",
        description: "Introduce to team and key colleagues",
        category: "HR",
        order: 10,
        isRequired: true,
        estimatedTime: 60,
      },
    ];

    for (const item of onboardingItems) {
      await prisma.checklistItem.create({
        data: {
          templateId: onboardingTemplate.id,
          ...item,
        },
      });
    }

    // Create Offboarding Template
    const offboardingTemplate = await prisma.checklistTemplate.create({
      data: {
        name: "Standard Offboarding",
        type: "offboarding",
        description:
          "Complete offboarding checklist for departing staff members",
        isActive: true,
      },
    });

    console.log("✅ Created offboarding template:", offboardingTemplate.name);

    // Add offboarding checklist items
    const offboardingItems = [
      {
        title: "Return laptop and equipment",
        description: "Collect laptop, charger, and any other IT equipment",
        category: "IT Recovery",
        order: 1,
        isRequired: true,
        estimatedTime: 30,
      },
      {
        title: "Disable user accounts",
        description: "Disable Active Directory account and email access",
        category: "IT Security",
        order: 2,
        isRequired: true,
        estimatedTime: 15,
      },
      {
        title: "Revoke system access",
        description: "Remove access to all systems and applications",
        category: "IT Security",
        order: 3,
        isRequired: true,
        estimatedTime: 20,
      },
      {
        title: "Return ID badge",
        description: "Collect staff ID badge and disable access",
        category: "Security",
        order: 4,
        isRequired: true,
        estimatedTime: 5,
      },
      {
        title: "Remove building access",
        description: "Disable key fob and building access permissions",
        category: "Security",
        order: 5,
        isRequired: true,
        estimatedTime: 10,
      },
      {
        title: "Return keys",
        description: "Collect all office, filing cabinet, and facility keys",
        category: "Facilities",
        order: 6,
        isRequired: true,
        estimatedTime: 10,
      },
      {
        title: "Clear workspace",
        description:
          "Ensure workspace is cleared of personal and confidential items",
        category: "Facilities",
        order: 7,
        isRequired: true,
        estimatedTime: 30,
      },
      {
        title: "Complete HR exit interview",
        description: "Conduct final HR interview and documentation",
        category: "HR",
        order: 8,
        isRequired: true,
        estimatedTime: 45,
      },
      {
        title: "Process final payroll",
        description: "Complete final pay calculations and benefits processing",
        category: "HR",
        order: 9,
        isRequired: true,
        estimatedTime: 30,
      },
      {
        title: "Knowledge transfer",
        description: "Ensure handover of responsibilities and documentation",
        category: "Department",
        order: 10,
        isRequired: true,
        estimatedTime: 120,
      },
      {
        title: "Archive files",
        description: "Archive personnel file and work documents",
        category: "HR",
        order: 11,
        isRequired: true,
        estimatedTime: 20,
      },
    ];

    for (const item of offboardingItems) {
      await prisma.checklistItem.create({
        data: {
          templateId: offboardingTemplate.id,
          ...item,
        },
      });
    }

    console.log("✅ Created checklist items for both templates");
    console.log(
      `🎉 Seeding complete! Created ${
        onboardingItems.length + offboardingItems.length
      } checklist items`
    );

    await prisma.$disconnect();
  } catch (error) {
    console.error("❌ Error seeding checklist templates:", error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

seedChecklistTemplates();

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const cbs = await prisma.campaignBeneficiary.findMany({
        include: {
            user: { select: { fullName: true } },
            campaign: { select: { title: true } }
        }
    });
    console.log(JSON.stringify(cbs, null, 2));
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());

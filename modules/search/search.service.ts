import prisma from "../../config/db";

export const searchWorkspace = async (userId: string, query: string) => {
    if (!query.trim()) {
        return { projects: [], prompts: [] };
    }

    const [projects, prompts, commits] = await Promise.all([
        // Search projects user has access to (created or member)
        prisma.projects.findMany({
            where: {
                AND: [
                    {
                        OR: [
                            { name: { contains: query, mode: 'insensitive' } },
                            { description: { contains: query, mode: 'insensitive' } },
                        ],
                    },
                    {
                        OR: [
                            { created_by: userId },
                            { project_users: { some: { user_id: userId } } },
                        ],
                    },
                ],
            },
            take: 10,
            orderBy: {
                created_at: 'desc'
            }
        }),
        // Search prompts user has access to
        prisma.prompts.findMany({
            where: {
                AND: [
                    { name: { contains: query, mode: 'insensitive' } },
                    {
                        OR: [
                            { created_by: userId },
                            {
                                projects: {
                                    project_users: { some: { user_id: userId } }
                                }
                            }
                        ],
                    },
                ],
            },
            include: {
                projects: {
                    select: { name: true }
                }
            },
            take: 10,
            orderBy: {
                created_at: 'desc'
            }
        }),
        // Search commits user has access to
        prisma.commits.findMany({
            where: {
                AND: [
                    { commit_message: { contains: query, mode: 'insensitive' } },
                    {
                        OR: [
                            { created_by: userId },
                            {
                                prompts: {
                                    projects: {
                                        project_users: { some: { user_id: userId } }
                                    }
                                }
                            }
                        ],
                    },
                ],
            },
            include: {
                prompts: {
                    select: { name: true }
                }
            },
            take: 10,
            orderBy: {
                created_at: 'desc'
            }
        }),
    ]);

    return {
        projects,
        prompts,
        commits,
    };
};

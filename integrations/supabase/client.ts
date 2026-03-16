import { createClient } from "@supabase/supabase-js";
import { PrismaClient } from "@prisma/client/extension";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY,{
    auth:{
        ...(typeof window !== "undefined" ? {storage: window.localStorage} : {}),
        persistSession:true,
        autoRefreshToken:true,
    }
});

const globalForPrisma = globalThis as unknown as {
    prisma : PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production'){
    globalForPrisma.prisma = prisma;
}

import { prisma } from "@/integrations/supabase/client";
import { noteCreateSchema, noteQuerySchema } from "@/lib/validation";
import { NextRequest , NextResponse} from "next/server";

export async function GET(request:NextRequest){
    try {
        const {searchParams} = new URL(request.url);
        
        const parsed = noteQuerySchema.safeParse({
            userId: searchParams.get('userId') ?? '',
            search: searchParams.get('search') ?? undefined,
        });

        if(!parsed.success){
            return NextResponse.json({ error: 'Invalid query parameters' }, { status: 400 });
        }

        const {userId ,search } = parsed.data;

        const where:any = {user_id:userId};
        if(search){
            where.title = {contains: search, mode:'insensitive'};
        }

        const notes = await prisma.note.findMany({
            where,
            orderBy: {updated_at: 'desc'},
        });

        return NextResponse.json(notes);

    } catch (error) {
        return NextResponse.json({error:'Failed to fetch notes'},{status:500});
    }
}

export async function POST(request: NextRequest) {
    try {
      const body = await request.json();
      const parsed = noteCreateSchema.safeParse(body);
  
      if (!parsed.success) {
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
      }
  
      const { title, content, userId } = parsed.data;
  
      const note = await prisma.note.create({
        data: { title: title ?? '', content: content ?? '', user_id: userId },
      });
  
      return NextResponse.json(note);
    } catch (error) {
      return NextResponse.json({ error: 'Failed to create note' }, { status: 500 });
    }
  }
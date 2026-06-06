import path from "path";
import { promises as fs } from "fs";
import { NextResponse } from "next/server";
import { deleteService, getServiceById, updateService } from "@/lib/services-db";

// app/api/services/[id]/route.js

export async function GET(request, { params }) {
  const { id } = await params;
  const service = await getServiceById(parseInt(id, 10));
  if (!service) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(service);
}

export async function PUT(request, { params }) {
  const { id } = await params;
  const formData = await request.formData();
  const updates = {};
  for (const [key, value] of formData.entries()) {
    if (key !== 'image') updates[key] = value;
  }
  if (updates.price) updates.price = parseInt(updates.price, 10);
  if (updates.duration) updates.duration = parseInt(updates.duration, 10);

  const imageFile = formData.get('image');
  if (imageFile && imageFile.size > 0) {
    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filename = Date.now() + '-' + imageFile.name;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    await fs.mkdir(uploadDir, { recursive: true });
    await fs.writeFile(path.join(uploadDir, filename), buffer);
    updates.image = '/uploads/' + filename;
  }

  try {
    const updated = await updateService(parseInt(id, 10), updates);
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(request, { params }) {
  const { id } = await params;
  try {
    await deleteService(parseInt(id, 10));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
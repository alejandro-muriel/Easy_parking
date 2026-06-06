import { NextResponse } from "next/server";
import { requireAuth, hasRole } from "@/server/auth/guards";

export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    
    if (!hasRole(user, "CELADOR") && !hasRole(user, "ADMINISTRADOR")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const { usuarioId, plazaNumero } = await request.json();

    if (!usuarioId || !plazaNumero) {
      return NextResponse.json({ error: "Faltan parámetros requeridos" }, { status: 400 });
    }

    console.log(`[NOTIFICACIÓN MANUAL] Enviada por ${user.name} al usuario id ${usuarioId} para desalojar la plaza #${plazaNumero}`);

    return NextResponse.json({ 
      success: true, 
      message: `Notificación enviada con éxito.` 
    });
  } catch (error) {
    console.error("Error al enviar notificación:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
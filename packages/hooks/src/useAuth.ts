import { useState, useEffect } from "react";
import { type User } from "firebase/auth";
import { onAuth } from "@mercadovivo/firebase";
import { obtenerUsuario } from "@mercadovivo/core";
import type { Usuario } from "@mercadovivo/types";

export function useAuth() {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onAuth(async (u) => {
      setFirebaseUser(u);
      if (u) {
        const perfil = await obtenerUsuario(u.uid);
        setUsuario(perfil);
      } else {
        setUsuario(null);
      }
      setLoading(false);
    });
  }, []);

  return { firebaseUser, usuario, loading };
}

import { Request, Response } from "express";
import { AuthService } from "./auth.service.ts";

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  login = async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email y contraseña son requeridos" });
      }

      const resultado = await this.authService.login(email, password);
      
      if (!resultado) {
        return res.status(401).json({ message: "Credenciales inválidas" });
      }

      res.json(resultado);
    } catch (error: any) {
      console.error("Error en login:", error);
      if (error.message === "Usuario inactivo") {
          return res.status(403).json({ message: error.message });
      }
      res.status(500).json({ message: "Error interno del servidor" });
    }
  };
}

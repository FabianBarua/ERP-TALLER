import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { AuthRepository } from "./auth.repository.ts";

export class AuthService {
  private authRepository: AuthRepository;

  constructor() {
    this.authRepository = new AuthRepository();
  }

  async login(email: string, passwordPlano: string) {
    const usuario = await this.authRepository.findByEmail(email);
    if (!usuario) {
      return null;
    }

    if (!usuario.activo) {
      throw new Error("Usuario inactivo");
    }

    const passwordValido = await bcrypt.compare(passwordPlano, usuario.passwordHash);
    if (!passwordValido) {
      return null;
    }

    const JWT_SECRET = process.env.JWT_SECRET || "cambia_esta_clave_secreta_por_una_segura";
    
    const token = jwt.sign(
      { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol },
      JWT_SECRET,
      { expiresIn: "8h" }
    );

    return {
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol
      }
    };
  }
}

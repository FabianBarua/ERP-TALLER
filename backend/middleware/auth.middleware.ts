import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Extendiendo el Request de Express para incluir el usuario
declare global {
  namespace Express {
    interface Request {
      usuario?: any;
    }
  }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: "No se proporcionó token de autenticación" });
    }

    const token = authHeader.split(" ")[1]; // Bearer <token>
    if (!token) {
      return res.status(401).json({ message: "Formato de token inválido" });
    }

    const JWT_SECRET = process.env.JWT_SECRET || "cambia_esta_clave_secreta_por_una_segura";
    
    const decodificado = jwt.verify(token, JWT_SECRET);
    req.usuario = decodificado;
    
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token inválido o expirado" });
  }
};

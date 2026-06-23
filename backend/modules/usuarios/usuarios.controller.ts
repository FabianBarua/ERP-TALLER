import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { UsuariosRepository } from "./usuarios.repository.ts";

export class UsuariosController {
  private usuariosRepository: UsuariosRepository;

  constructor() {
    this.usuariosRepository = new UsuariosRepository();
  }

  // Obtener listado de usuarios
  getUsuarios = async (req: Request, res: Response) => {
    try {
      const usuarios = await this.usuariosRepository.findAll();
      res.json(usuarios);
    } catch (error) {
      console.error("Error al obtener usuarios:", error);
      res.status(500).json({ message: "Error interno al listar usuarios" });
    }
  };

  // Crear un nuevo usuario
  createUsuario = async (req: Request, res: Response) => {
    try {
      const { nombre, email, password, rol } = req.body;

      if (!nombre || !email || !password) {
        return res.status(400).json({ message: "Nombre, email y contraseña son obligatorios" });
      }

      // Validar si ya existe el email
      const usuarioExistente = await this.usuariosRepository.findByEmail(email);
      if (usuarioExistente) {
        return res.status(400).json({ message: "El correo electrónico ya está registrado" });
      }

      // Hashear la contraseña
      const passwordHash = await bcrypt.hash(password, 10);
      const rolUser = rol || "operador";

      const nuevoUsuario = await this.usuariosRepository.create(
        nombre,
        email,
        passwordHash,
        rolUser
      );

      res.status(201).json(nuevoUsuario);
    } catch (error) {
      console.error("Error al crear usuario:", error);
      res.status(500).json({ message: "Error interno al crear el usuario" });
    }
  };
}

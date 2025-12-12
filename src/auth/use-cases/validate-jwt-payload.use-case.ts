import { Injectable } from '@nestjs/common';
import { AuthenticatedUser, JwtPayload } from '../interfaces/auth.interface';

@Injectable()
export class ValidateJwtPayloadUseCase {
  execute(payload: JwtPayload): AuthenticatedUser {
    // Aqui você pode adicionar lógica para:
    // - Buscar o usuário no banco de dados
    // - Verificar se o usuário ainda está ativo
    // - Retornar informações adicionais do usuário

    return {
      email: payload.email,
      firstName: payload.firstName,
      lastName: payload.lastName,
      picture: payload.picture,
    };
  }
}

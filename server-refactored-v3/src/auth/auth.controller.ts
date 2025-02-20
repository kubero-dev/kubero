import {
  Controller,
  Request,
  UseGuards,
  Post,
  Get,
  Response,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { ApiBearerAuth, ApiForbiddenResponse, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { GetMethodsDTO, LoginOKResponseDTO, LoginDTO, GetSessionDTO } from './auth.dto';
import { OKDTO } from 'src/shared/dto/ok.dto';

@Controller({ path: 'api/auth', version: '1' })
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ 
    summary: 'Login with username and password', 
    description: 'Returns the login JWT token'
  })
  @ApiOkResponse({
    description: 'A List of Authentication Methods',
    type: LoginOKResponseDTO,
    isArray: false,
  })
  async login(@Body() auth: LoginDTO) {
    const { username, password } = auth;

    if (!username || !password) {
      return { message: 'Username and password are required', status: 400 };
    }

    return await this.authService.login(username, password);
  }

  @Get('logout')
  @ApiOperation({
    summary: 'Logout the current session',
    description: 'Clears the current JWT Token',
  })
  @ApiOkResponse({
    description: 'Logout OK',
    type: OKDTO,
    isArray: false,
  })
  async logout(@Response() res: any): Promise<void> {
    res.clearCookie('kubero.JWT_TOKEN');
    res.send({ message: 'Logged out', status: '200' } as OKDTO);
  }

  @Get('session')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('bearerAuth')
  @ApiOperation({
    summary: 'Get the current session',
    description: 'Returns the current session information',
  })
  @ApiOkResponse({
    description: 'Session Information',
    type: GetSessionDTO,
    isArray: false,
  })
  @ApiForbiddenResponse({
    description: 'Error: Unauthorized',
    type: OKDTO,
    isArray: false,
  })
  async session(@Request() req, @Response() res) {
    let isAuthenticated = await this.authService.validateToken(req.headers.authorization.split(' ')[1]);
    const { message, status } = await this.authService.getSession(isAuthenticated);
    res.status(status);
    res.send(message);
  }

  @Get('methods')
  @ApiOperation({ 
    summary: 'Get the available authentication methods', 
    description: 'Returns a list of available authentication methods'
  })
  @ApiOkResponse({
    description: 'A List of Authentication Methods',
    type: GetMethodsDTO,
    isArray: false,
  })
  async getMethods(): Promise<GetMethodsDTO> { 
    return this.authService.getMethods();
  }
  
  @Get('github')
  @UseGuards(AuthGuard('github'))
  @ApiBearerAuth('OAuth2')
  async github() {
    return 'auth';
  }

  @Get('github/callback')
  @UseGuards(AuthGuard('github'))
  @ApiBearerAuth('OAuth2')
  async githubCallback(@Request() req: any, @Response() res: any) {
    //console.log(req.user);
    const token = await this.authService.loginOAuth2(req.user.username)
    res.cookie('kubero.JWT_TOKEN', token);
    res.redirect('/');
  }
}

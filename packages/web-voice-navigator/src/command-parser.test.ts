import { CommandParser } from './command-parser';

describe('CommandParser', () => {
  let commandParser: CommandParser;

  beforeEach(() => {
    commandParser = new CommandParser();
  });

  describe('parse', () => {
    describe('scroll commands', () => {
      it('should be able to parse "rolar para baixo" command', () => {
        const result = commandParser.parse('rolar para baixo');

        expect(result).toEqual({
          action: 'scroll',
          value: 'down',
        });
      });

      it('should be able to parse "rolar para cima" command', () => {
        const result = commandParser.parse('rolar para cima');

        expect(result).toEqual({
          action: 'scroll',
          value: 'up',
        });
      });

      it('should be able to parse "rola para baixo" command', () => {
        const result = commandParser.parse('rola para baixo');

        expect(result).toEqual({
          action: 'scroll',
          value: 'down',
        });
      });

      it('should be able to handle case insensitive scroll commands', () => {
        const result = commandParser.parse('ROLAR PARA CIMA');

        expect(result).toEqual({
          action: 'scroll',
          value: 'up',
        });
      });
    });

    describe('fill commands', () => {
      it('should be able to parse basic fill command with target and value', () => {
        const result = commandParser.parse('preencher email com test@example.com');

        expect(result).toEqual({
          action: 'preencher',
          target: 'email',
          value: 'test@example.com',
        });
      });

      it('should be able to parse fill command with complex value containing "com"', () => {
        const result = commandParser.parse('preencher nome com João da Silva com Santos');

        expect(result).toEqual({
          action: 'preencher',
          target: 'nome',
          value: 'joão da silva com santos',
        });
      });

      it('should be able to parse fill command with whitespace', () => {
        const result = commandParser.parse('  preencher   telefone   com   123456789  ');

        expect(result).toEqual({
          action: 'preencher',
          target: 'telefone',
          value: '123456789',
        });
      });

      it('should be able to handle case insensitive fill commands', () => {
        const result = commandParser.parse('PREENCHER SENHA COM 123456');

        expect(result).toEqual({
          action: 'preencher',
          target: 'senha',
          value: '123456',
        });
      });
    });

    describe('click commands', () => {
      it('should be able to parse "clicar em" command', () => {
        const result = commandParser.parse('clicar em botão enviar');

        expect(result).toEqual({
          action: 'clicar',
          target: 'botão enviar',
        });
      });

      it('should be able to parse "clicar no" command', () => {
        const result = commandParser.parse('clicar no menu');

        expect(result).toEqual({
          action: 'clicar',
          target: 'menu',
        });
      });

      it('should be able to parse "clicar na" command', () => {
        const result = commandParser.parse('clicar na opção');

        expect(result).toEqual({
          action: 'clicar',
          target: 'opção',
        });
      });

      it('should be able to handle case insensitive click commands', () => {
        const result = commandParser.parse('CLICAR EM BOTÃO');

        expect(result).toEqual({
          action: 'clicar',
          target: 'botão',
        });
      });

      it('should be able to handle click commands with extra whitespace', () => {
        const result = commandParser.parse('  clicar em   link   ');

        expect(result).toEqual({
          action: 'clicar',
          target: 'link',
        });
      });
    });

    describe('focus commands', () => {
      it('should be able to parse "focar em" command', () => {
        const result = commandParser.parse('focar em campo de texto');

        expect(result).toEqual({
          action: 'focar',
          target: 'campo de texto',
        });
      });

      it('should be able to parse "focar no" command', () => {
        const result = commandParser.parse('focar no input');

        expect(result).toEqual({
          action: 'focar',
          target: 'input',
        });
      });

      it('should be able to parse "focar na" command', () => {
        const result = commandParser.parse('focar na caixa de pesquisa');

        expect(result).toEqual({
          action: 'focar',
          target: 'caixa de pesquisa',
        });
      });

      it('should be able to handle case insensitive focus commands', () => {
        const result = commandParser.parse('FOCAR EM TEXTAREA');

        expect(result).toEqual({
          action: 'focar',
          target: 'textarea',
        });
      });
    });

    describe('invalid commands', () => {
      it('should be able to return null for unrecognized commands', () => {
        const result = commandParser.parse('comando inválido');

        expect(result).toBeNull();
      });

      it('should be able to return null for empty string', () => {
        const result = commandParser.parse('');

        expect(result).toBeNull();
      });

      it('should be able to return null for whitespace only', () => {
        const result = commandParser.parse('   ');

        expect(result).toBeNull();
      });

      it('should be able to return null for partial commands', () => {
        const result = commandParser.parse('clicar');

        expect(result).toBeNull();
      });

      it('should be able to return null for incomplete fill commands', () => {
        const result = commandParser.parse('preencher campo');

        expect(result).toEqual({
          action: 'preencher',
          target: 'campo',
          value: '',
        });
      });
    });
  });
});

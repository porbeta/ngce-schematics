import { EmptyTree, Tree } from '@angular-devkit/schematics';
import { findFile, hasFile } from './find-file';

describe('find-file', () => {
  describe('findFile', () => {

    let host: Tree;
    const modulePath = '/foo/src/app/app.module.ts';
    beforeEach(() => {
      host = new EmptyTree();
      host.create(modulePath, 'app module');
    });

    it('should find a file', () => {
      const foundModule = findFile(host, 'foo/src/app/bar', 'app.module.ts');
      expect(foundModule).toEqual(modulePath);
    });

    it('should not find a file in another sub dir', () => {
      host.create('/foo/src/app/buzz/buzz.module.ts', 'app module');
      const foundModule = findFile(host, 'foo/src/app/bar', 'app.module.ts');
      expect(foundModule).toEqual(modulePath);
    });

    it('should ignore non-matching files', () => {
      host.create('/foo/src/app/app-routing.module.ts', 'app module');
      const foundModule = findFile(host, 'foo/src/app/bar', 'app.module.ts');
      expect(foundModule).toEqual(modulePath);
    });

    it('should work with weird paths', () => {
      host.create('/foo/src/app/app-routing.module.ts', 'app module');
      const foundModule = findFile(host, 'foo//src//app/bar/', 'app.module.ts');
      expect(foundModule).toEqual(modulePath);
    });

    it('should throw if no modules found', () => {
      try {
        findFile(host, 'foo/src/app/bar', 'oops.module.ts');
        throw new Error('Succeeded, should have failed');
      } catch (err) {
        expect(err.message).toMatch(/Could not find the file under path/);
      }
    });
  });

  describe('hasFile', () => {

    let host: Tree;
    const modulePath = '/foo/src/app/app.module.ts';
    beforeEach(() => {
      host = new EmptyTree();
      host.create(modulePath, 'app module');
    });

    it('should find a file', () => {
      const fileExists = hasFile(host, 'foo/src/app/bar', 'app.module.ts');
      expect(fileExists).toBeTrue();
    });

    it('should throw if no modules found', () => {
      const fileExists = hasFile(host, 'foo/src/app/bar', 'oops.module.ts');
      expect(fileExists).toBeFalse();
    });
  });
});

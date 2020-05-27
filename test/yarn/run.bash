rm -f ./package.json
rm -f ./rxdb-local.tgz
yarn init -2 -y
(cd ../../ && npx yarn@1.13.0 pack ../../ --filename ./test/yarn/rxdb-local.tgz)
yarn add ./rxdb-local.tgz

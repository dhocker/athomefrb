#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import uuid

fh = open("secret_key", "w")
u = uuid.uuid4()
fh.write(u.hex)
fh.close()
print("Secret key stored in: secret_key")
